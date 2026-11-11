import type { FacilityKind } from "../simulation/resort";
const paper = `<filter id="paper"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="8"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".10"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter>`;
const wrap = (inner: string, w = 200, h = 170) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${paper}</defs>${inner}</svg>`;
const line = 'stroke="#fff5df" stroke-width="7" stroke-linejoin="round"';
export const facilityArt: Record<FacilityKind, string> = {
  spring: wrap(
    `<ellipse cx="102" cy="143" rx="90" ry="23" fill="#557767" opacity=".15"/><path d="M13 89 35 64 68 59 91 45 127 53 157 61 181 81 186 117 161 139 112 151 65 143 24 125Z" fill="#b4ae96" ${line}/><ellipse cx="100" cy="102" rx="72" ry="34" fill="#b9e0d9" stroke="#7bb1ac" stroke-width="5"/><path d="M47 103q25 14 51 0m-9 18q23 9 43-3m-27-36q24 8 43 0" fill="none" stroke="#eef8e9" stroke-width="3"/><path d="M71 48q-14-17 0-29m29 30q-14-19 2-33m25 38q-11-12 3-26" fill="none" stroke="#fff9e8" stroke-width="7" stroke-linecap="round"/><path d="m20 65 15-13 21 7-5 17-24 2m117-6 18-14 20 9-1 20-26 3" fill="#969d85" ${line}/><circle cx="44" cy="109" r="10" fill="#f5ba79"/><circle cx="49" cy="105" r="2" fill="#6e7146"/>`,
  ),
  cafe: wrap(
    `<ellipse cx="105" cy="153" rx="80" ry="14" fill="#557767" opacity=".15"/><path d="M38 68h125v82H38Z" fill="#f5d69f" ${line}/><path d="m21 66 17-44h126l18 44Z" fill="#df8e80" ${line}/><path d="M39 24v39m31-39v39m32-39v39m31-39v39m30-39v39" stroke="#f7d5b7" stroke-width="14"/><path d="M24 64q8 23 24 0 17 23 32 0 18 23 34 0 17 23 33 0 17 23 32 0" fill="#df8e80" stroke="#fff5df" stroke-width="4"/><rect x="54" y="92" width="91" height="29" rx="3" fill="#675f48"/><rect x="48" y="119" width="103" height="10" rx="3" fill="#c98c60"/><path d="M66 117q0-25 16-25 17 0 16 25m7 0q0-25 16-25 17 0 16 25" fill="#f3ba71"/><path d="M86 11h28v29H86Z" fill="#fff5df" stroke="#dba76c" stroke-width="3"/><path d="M92 20h15m-15 7h15" stroke="#c07b56" stroke-width="3"/>`,
  ),
  lodge: wrap(
    `<ellipse cx="102" cy="151" rx="84" ry="15" fill="#557767" opacity=".15"/><path d="M38 74h125v77H38Z" fill="#d6ab7c" ${line}/><path d="M20 77 101 19 182 77Z" fill="#879b80" ${line}/><path d="m41 70 60-41 60 41" fill="none" stroke="#a5b99a" stroke-width="7"/><rect x="88" y="100" width="27" height="51" rx="10" fill="#8e6d54" stroke="#fff5df" stroke-width="3"/><circle cx="107" cy="127" r="2" fill="#f6d887"/><rect x="49" y="95" width="26" height="30" rx="3" fill="#cce2d0" stroke="#fff5df" stroke-width="4"/><path d="M62 96v29m-13-15h26" stroke="#fff5df" stroke-width="3"/><rect x="130" y="95" width="23" height="30" rx="3" fill="#cce2d0" stroke="#fff5df" stroke-width="4"/><path d="M143 34V13h18v34" fill="#b9876e" ${line}/><path d="m17 146 15-34 15 34m110 0 16-31 16 31" fill="#98af7b" ${line}/>`,
  ),
  garden: wrap(
    `<ellipse cx="100" cy="145" rx="87" ry="19" fill="#557767" opacity=".12"/><path d="m15 135 12-34 39-12 32 6 38-12 42 25 7 31-45 15-68-2Z" fill="#b9cb91" ${line}/><path d="M52 126V70m42 63V47m50 86V66" stroke="#76966e" stroke-width="6"/><path d="M51 94q-26-33-31-12 4 25 31 12m2-12q22-29 26-9-3 20-26 9m39-7q-24-24-26-7 4 21 26 7m4-16q26-27 29-8-5 21-29 8m45 32q-25-27-28-6 5 20 28 6m5-13q22-26 27-7-2 17-27 7" fill="#8da77a"/><g fill="#e9a38f" stroke="#fff5df" stroke-width="4"><circle cx="52" cy="64" r="16"/><circle cx="96" cy="42" r="19"/><circle cx="146" cy="61" r="15"/></g><g fill="#f9dda3"><circle cx="52" cy="64" r="6"/><circle cx="96" cy="42" r="7"/><circle cx="146" cy="61" r="6"/></g><path d="M71 144v-20m-9 9h18" stroke="#f5efc9" stroke-width="4"/>`,
  ),
};
export const treeArt = wrap(
  `<ellipse cx="100" cy="155" rx="48" ry="10" fill="#557767" opacity=".13"/><path d="M90 97h21v61H90Z" fill="#b8916d" ${line}/><path d="m37 113 30-34H50l26-35h-8l33-36 33 36h-9l28 35h-18l28 34Z" fill="#829f7f" ${line}/><path d="m69 103 30-29m-17-16 16-16" stroke="#a9bf90" stroke-width="5"/>`,
);
export const blossomArt = wrap(
  `<ellipse cx="100" cy="155" rx="55" ry="10" fill="#557767" opacity=".13"/><path d="M91 91h17v67H91Z" fill="#b8916d" ${line}/><path d="m98 109-27-35m30 23 23-29" stroke="#b8916d" stroke-width="10"/><path d="M32 63q-7-28 22-29 8-32 35-24 30-16 43 14 33-3 34 31 24 23-1 44-27 16-53 4-31 14-51-4-40 4-29-36Z" fill="#e6b0a1" ${line}/><g fill="#f4d1bd"><circle cx="65" cy="53" r="12"/><circle cx="101" cy="35" r="14"/><circle cx="130" cy="70" r="16"/><circle cx="86" cy="84" r="14"/></g>`,
);
export const signArt = wrap(
  `<path d="M59 101h13v68H59m70-68h13v68h-13" fill="#b79268"/><path d="m22 25 156-4 5 82-158 4Z" fill="#fcf0d8" ${line}/><path d="m30 35 143-4 1 62-139 4Z" fill="#e9bb81"/><text x="102" y="62" text-anchor="middle" font-family="Georgia" font-size="20" font-weight="bold" fill="#705843">TUBBY</text><text x="102" y="86" text-anchor="middle" font-family="Georgia" font-size="17" fill="#705843">SPRINGS</text>`,
);
export const artUri = (svg: string) =>
  "data:image/svg+xml;base64," +
  btoa(String.fromCharCode(...new TextEncoder().encode(svg)));
export function icon(kind: string): string {
  const paths: Record<string, string> = {
    coin: '<circle cx="12" cy="12" r="8"/><path d="M12 7v10m3-8h-5a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4H9"/>',
    star: '<path d="m12 3 3 6 6 1-4.5 4.5 1 6-5.5-3-5.5 3 1-6L3 10l6-1Z"/>',
    guests:
      '<circle cx="9" cy="7" r="3"/><path d="M3 21v-4a6 6 0 0 1 12 0v4m1-17a3 3 0 0 1 0 6m2 3a6 6 0 0 1 3 5v3"/>',
    book: '<path d="M3 4h6l3 2 3-2h6v16h-6l-3 2-3-2H3Zm9 2v16"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
    leaf: '<path d="M5 19C-1 7 10 2 21 3c0 13-9 20-16 16Zm0 0L16 8"/>',
    pause: '<path d="M8 4v16m8-16v16"/>',
    play: '<path d="m6 3 15 9-15 9Z"/>',
    sound: '<path d="M3 9h4l5-5v16l-5-5H3Zm13-1q5 4 0 8m3-12q9 8 0 16"/>',
    build: '<path d="m3 12 9-9 9 9M5 10v11h14V10m-10 11v-7h6v7"/>',
    close: '<path d="m5 5 14 14M19 5 5 19"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[kind] ?? paths.leaf}</svg>`;
}
