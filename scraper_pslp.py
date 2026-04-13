"""
Scraper offerte di lavoro - pslp.regione.piemonte.it
=====================================================
Installa dipendenze:
    py -3 -m pip install playwright
    py -3 -m playwright install chromium

Uso:
    py -3 scraper_pslp.py --comune "Verbania" --distanza 30
    py -3 scraper_pslp.py --comune "Verbania" --distanza 30 --output annunci_vco.csv
    py -3 scraper_pslp.py --comune "Verbania" --distanza 30 --visible
"""

import asyncio
import json
import csv
import argparse
from datetime import datetime
from playwright.async_api import async_playwright

BASE_URL = "https://pslp.regione.piemonte.it"
LIST_URL = f"{BASE_URL}/pslpwcl/pslpfcweb/consulta-annunci/profili-ricercati"


async def main(comune, distanza, output_csv, output_json, headless):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=headless)
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        )
        page = await context.new_page()

        # ── Intercetta risposte JSON ──────────────────────────────────
        annunci_api = []

        async def on_response(response):
            url = response.url
            ct  = response.headers.get("content-type", "")
            if "json" not in ct or "pslpbff" not in url:
                return
            try:
                data = await response.json()
                if not isinstance(data, dict):
                    return
                items = (
                    data.get("list") or
                    data.get("content") or
                    data.get("annunci") or []
                )
                if not items or not isinstance(items[0], dict):
                    return
                primo = items[0]
                if any(k in primo for k in [
                    "titolo", "profilo", "mansione", "descrizione",
                    "idAnnuncio", "codAnnuncio", "figura"
                ]):
                    print(f"[+] Endpoint annunci trovato: {url}")
                    print(f"    {len(items)} risultati")
                    annunci_api.extend(items)
            except Exception:
                pass

        page.on("response", on_response)

        # ── Carica la pagina ──────────────────────────────────────────
        print(f"[*] Carico {LIST_URL}")
        await page.goto(LIST_URL, wait_until="networkidle", timeout=60000)
        await asyncio.sleep(2)

        # ── Campo COMUNE (PrimeNG p-dropdown) ─────────────────────────
        # La struttura è: <p-dropdown> > <div.p-dropdown> > <div.p-hidden-accessible> > <input#comune>
        # Per aprirlo bisogna cliccare sul div.p-dropdown (nonno dell'input)
        if comune:
            print(f"[*] Inserisco comune: {comune}")
            try:
                # Clicca sul p-dropdown container (bisnonno dell'input)
                await page.click("p-dropdown", timeout=10000)
                await asyncio.sleep(1)

                # Digita nel filtro del dropdown (PrimeNG apre un input di ricerca)
                await page.keyboard.type(comune, delay=100)
                await asyncio.sleep(2)

                # Le opzioni sono in ul.p-dropdown-items > li.p-dropdown-item
                opzioni = page.locator("ul.p-dropdown-items li.p-dropdown-item")
                n = await opzioni.count()
                print(f"    Opzioni trovate: {n}")

                if n == 0:
                    # Prova selettori alternativi PrimeNG
                    opzioni = page.locator(".p-dropdown-item, li[aria-label]")
                    n = await opzioni.count()
                    print(f"    Opzioni (alt): {n}")

                if n > 0:
                    for i in range(n):
                        testo = (await opzioni.nth(i).inner_text()).strip()
                        print(f"      [{i}] {testo}")
                    # Seleziona la prima
                    await opzioni.first.click()
                    await asyncio.sleep(1)
                    print(f"[+] Comune selezionato")
                else:
                    print("[!] Nessuna opzione trovata nel dropdown")

            except Exception as e:
                print(f"[!] Errore campo comune: {e}")

        # ── Campo DISTANZA (rangeKM) ──────────────────────────────────
        # Il campo è disabled finché non viene selezionato il comune
        if distanza:
            print(f"[*] Attendo che #rangeKM si abiliti...")
            try:
                # Aspetta che il campo distanza diventi enabled (max 10s)
                await page.wait_for_selector(
                    "#rangeKM:not([disabled])",
                    timeout=10000
                )
                print(f"[+] Campo distanza abilitato, inserisco {distanza} km")
                await page.click("#rangeKM")
                await asyncio.sleep(0.3)
                await page.keyboard.press("Control+a")
                await page.keyboard.type(str(distanza))
                await asyncio.sleep(0.3)
            except Exception as e:
                print(f"[!] Errore campo distanza (forse comune non selezionato): {e}")

        # ── Clicca CERCA ──────────────────────────────────────────────
        print("[*] Attendo che CERCA si abiliti e clicco...")
        try:
            await page.wait_for_selector(
                'button:has-text("CERCA"):not([disabled])',
                timeout=10000
            )
            await page.click('button:has-text("CERCA")')
            print("[+] CERCA cliccato")
        except Exception as e:
            print(f"[!] Errore click CERCA: {e}")

        print("[*] Attendo risultati...")
        await page.wait_for_load_state("networkidle", timeout=30000)
        await asyncio.sleep(4)

        # ── Risultati via API? ────────────────────────────────────────
        if annunci_api:
            print(f"\n[+] Totale annunci (API): {len(annunci_api)}")
            salva(annunci_api, output_csv, output_json)
            await browser.close()
            return

        # ── Fallback: estrai dal DOM ──────────────────────────────────
        print("[*] API non intercettata, provo estrazione dal DOM...")

        # Debug rapido
        debug = await page.evaluate("""
            () => ({
                testo: document.body.innerText.substring(0, 600),
                cards: document.querySelectorAll('mat-card, .card, [class*="annunci"], [class*="annuncio"], p-card').length
            })
        """)
        print(f"    Card trovate: {debug['cards']}")
        print(f"    Testo: {debug['testo'][:400]}")

        annunci_dom = []
        page_num = 1

        while True:
            await asyncio.sleep(2)
            cards = []
            for sel in [
                "app-card-annuncio", "app-annuncio-card",
                ".card-annuncio", "mat-card",
                "p-card", "[class*='annuncio']",
                ".p-card", "tr[class*='row']",
            ]:
                els = await page.locator(sel).all()
                if els:
                    cards = els
                    print(f"[+] Pagina {page_num}: {len(cards)} elementi con '{sel}'")
                    break

            if not cards:
                print("[!] Nessuna card trovata. Salvo debug_risultati.html")
                html = await page.content()
                with open("debug_risultati.html", "w", encoding="utf-8") as f:
                    f.write(html)
                break

            for card in cards:
                try:
                    testo = (await card.inner_text()).strip()
                    if not testo:
                        continue
                    href = ""
                    link = card.locator("a").first
                    if await link.count() > 0:
                        href = await link.get_attribute("href") or ""
                        if href and not href.startswith("http"):
                            href = BASE_URL + "/pslpwcl/" + href.lstrip("/")
                    annunci_dom.append({
                        "testo":    testo,
                        "url":      href,
                        "pagina":   page_num,
                        "estratto": datetime.now().strftime("%Y-%m-%d %H:%M"),
                    })
                except Exception:
                    pass

            print(f"    Totale: {len(annunci_dom)}")

            # Paginazione PrimeNG/Angular
            next_btn = page.locator(
                'button.mat-paginator-navigation-next:not([disabled]), '
                'button[aria-label*="successiv" i]:not([disabled]), '
                'button[aria-label*="next" i]:not([disabled]), '
                '.p-paginator-next:not(.p-disabled)'
            ).first
            if await next_btn.count() > 0 and await next_btn.is_enabled():
                await next_btn.click()
                await page.wait_for_load_state("networkidle", timeout=15000)
                page_num += 1
            else:
                print("[*] Ultima pagina.")
                break

        print(f"\n[+] Totale annunci (DOM): {len(annunci_dom)}")
        salva(annunci_dom, output_csv, output_json)
        await browser.close()


def salva(annunci, output_csv, output_json):
    if not annunci:
        print("[!] Nessun annuncio da salvare.")
        return

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    nome_csv = output_csv or f"annunci_{ts}.csv"

    keys = sorted({k for a in annunci if isinstance(a, dict) for k in a})
    if not keys:
        keys = ["testo", "url", "pagina", "estratto"]

    with open(nome_csv, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=keys, extrasaction="ignore")
        writer.writeheader()
        for a in annunci:
            writer.writerow(a if isinstance(a, dict) else {"testo": str(a)})
    print(f"[+] CSV salvato: {nome_csv}")

    if output_json:
        with open(output_json, "w", encoding="utf-8") as f:
            json.dump(annunci, f, ensure_ascii=False, indent=2)
        print(f"[+] JSON salvato: {output_json}")

    print(f"\nPrimi 3 annunci:")
    for a in annunci[:3]:
        if isinstance(a, dict):
            for k, v in list(a.items())[:6]:
                print(f"  {k}: {str(v)[:80]}")
        else:
            print(f"  {str(a)[:120]}")
        print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Scarica offerte di lavoro da pslp.regione.piemonte.it"
    )
    parser.add_argument("--comune",   default=None)
    parser.add_argument("--distanza", type=int, default=None)
    parser.add_argument("--output",   default=None)
    parser.add_argument("--json",     dest="output_json", default=None)
    parser.add_argument("--visible",  action="store_true",
                        help="Mostra il browser (consigliato per debug)")
    args = parser.parse_args()

    asyncio.run(main(
        comune      = args.comune,
        distanza    = args.distanza,
        output_csv  = args.output,
        output_json = args.output_json,
        headless    = not args.visible,
    ))
