const fs = require('fs');
const tj = JSON.parse(fs.readFileSync('data/tj.json', 'utf8')).data.surahs;
const uz = JSON.parse(fs.readFileSync('data/uz.json', 'utf8')).data.surahs;
const uzNames = "Фотиҳа,Бақара,Оли Имрон,Нисо,Моида,Анъом,Аъроф,Анфол,Тавба,Юнус,Ҳуд,Юсуф,Раъд,Иброҳим,Ҳижр,Наҳл,Исро,Каҳф,Марям,Тоҳа,Анбиё,Ҳаж,Муъминун,Нур,Фурқон,Шуаро,Намл,Қасас,Анкабут,Рум,Луқмон,Сажда,Аҳзоб,Сабаъ,Фотир,Ёсин,Соффат,Сод,Зумар,Ғофир,Фуссилат,Шуро,Зухруф,Духон,Жосия,Аҳқоф,Муҳаммад,Фатҳ,Ҳужурот,Қоф,Зориёт,Тур,Нажм,Қамар,Раҳмон,Воқеа,Ҳадид,Мужодала,Ҳашр,Мумтаҳана,Саф,Жумъа,Мунофиқун,Тағобун,Талоқ,Таҳрим,Мулк,Қалам,Ҳаққа,Маориж,Нуҳ,Жин,Муззаммил,Муддассир,Қиёмат,Инсон,Мурсалот,Набаъ,Назиъат,Абаса,Таквир,Инфитор,Мутаффифун,Иншиқоқ,Буруж,Ториқ,Аъло,Ғошия,Фажр,Балад,Шамс,Лайл,Зуҳо,Шарҳ,Тийн,Алақ,Қадр,Баййина,Залзала,Одиёт,Қориа,Такосур,Аср,Ҳумаза,Фил,Қурайш,Моъун,Кавсар,Кофирун,Наср,Масад,Ихлос,Фалақ,Нос".split(',');
if (uzNames.length !== 114) throw new Error('names ' + uzNames.length);
function stripParens(s) {
  let out = '', depth = 0;
  for (const ch of s) {
    if (ch === '(') { depth++; continue; }
    if (ch === ')') { if (depth > 0) depth--; continue; }
    if (depth === 0) out += ch;
  }
  out = out.replace(/\s+/g, ' ').replace(/\s+([.,;:!?»])/g, '$1').trim();
  return out.length >= 3 ? out : s.replace(/\s+/g, ' ').trim();
}
let g = 0;
const surahs = tj.map((s, i) => {
  const u = uz[i];
  const ayahs = s.ayahs.map((a, j) => {
    g++;
    return [a.text.replace(/^\uFEFF/, '').trim(), stripParens(u.ayahs[j].text), a.page, a.juz];
  });
  return { n: s.number, ar: s.name.replace(/^سُورَةُ /, ''), en: s.englishName, uz: uzNames[i], type: s.revelationType === 'Meccan' ? 'Макка' : 'Мадина', ayahs };
});
const bismillah = tj[0].ayahs[0].text.replace(/^\uFEFF/, '').trim();
fs.writeFileSync('js/quran-data.js', 'window.QURAN=' + JSON.stringify({ bismillah, surahs }) + ';\n', 'utf8');
console.log('ayahs', g, 'size', fs.statSync('js/quran-data.js').size);
