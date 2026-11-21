// Договор купли-продажи недвижимости. Универсальная форма для сделок в РФ.
// Проверяйте необходимость нотариального удостоверения и специальных условий.
#set page(paper: "a4", margin: (x: 2.2cm, y: 1.8cm), numbering: "1")
#set text(font: "New Computer Modern", size: 10pt, lang: "ru", fill: rgb("282828"))
#set par(justify: true, leading: 0.55em, spacing: 0.35em)

#let rule() = line(length: 100%, stroke: (paint: rgb("d79921"), thickness: 1pt))
#let val(v) = if v == "" or v == none { line(length: 6em, stroke: 0.5pt) } else { str(v) }
#let fld(label, v) = [#strong[#label:] #val(v)]
#let signature(p) = {
  let s = p.at("signature", default: "")
  if s == "" { line(length: 5em, stroke: 0.5pt) } else { box(image(bytes(s), format: "svg", width: 5em, height: 1.5em, fit: "contain")) }
}
#let heading(title) = [#v(0.45em)#text(size: 10.5pt, weight: "bold")[#title]#v(0.15em)]
#let party(title, p) = block(inset: (x: 8pt, y: 6pt), stroke: (paint: rgb("d5c4a1"), thickness: 0.5pt))[
  #strong[#title]
  #parbreak()
  #fld("Ф.И.О.", p.at("fio", default: ""))
  #parbreak()
  #fld("Паспорт (серия, номер, кем и когда выдан)", p.at("passport", default: ""))
  #parbreak()
  #fld("Адрес регистрации", p.at("address", default: ""))
  #if p.at("phone", default: "") != "" [#parbreak()#fld("Телефон", p.at("phone", default: ""))]
  #if p.at("basis", default: "") != "" [#parbreak()#fld("Документ — основание права", p.at("basis", default: ""))]
]

#let doc(data: none) = {
  align(center)[
    #text(size: 16pt, weight: "bold")[ДОГОВОР]
    #linebreak()
    #text(size: 12pt, weight: "bold")[купли-продажи объекта недвижимости]
  ]
  v(0.3em)
  rule()
  v(0.45em)
  grid(columns: (1fr, 1fr), gutter: 1em)[#fld("Место заключения", data.terms.at("place", default: ""))][#align(right)[#fld("Дата", data.terms.at("date", default: ""))]]
  [Граждане, указанные в разделе 1 настоящего договора, далее совместно именуемые «Стороны», заключили настоящий договор о нижеследующем.]

  heading("1. СТОРОНЫ ДОГОВОРА")
  for (i, s) in data.sellers.enumerate() { party("Продавец " + str(i + 1), s); v(0.2em) }
  for (i, b) in data.buyers.enumerate() { party("Покупатель " + str(i + 1), b); v(0.2em) }

  heading("2. ПРЕДМЕТ ДОГОВОРА")
  [2.1. Продавец обязуется передать в собственность Покупателя, а Покупатель — принять и оплатить следующий объект недвижимости:]
  block(fill: rgb("f9f5e9"), inset: 8pt, radius: 3pt)[
    #fld("Вид объекта", data.object.at("object_type", default: ""))
    #parbreak()
    #fld("Адрес (местоположение)", data.object.at("address", default: ""))
    #parbreak()
    #fld("Площадь, кв. м", data.object.at("area", default: ""))
    #parbreak()
    #fld("Кадастровый номер", data.object.at("cadastral", default: ""))
  ]
  [2.2. Право Продавца подтверждается документом, указанным в разделе 1. Сведения о записи о праве в ЕГРН:]
  parbreak()
  fld("номер и дата записи", data.object.at("ownership", default: ""))
  parbreak()
  [2.3. Обременения и ограничения прав:]
  parbreak()
  fld("указать либо написать «отсутствуют»", data.object.at("encumbrances", default: ""))
  parbreak()
  [2.4. Лица, сохраняющие право пользования объектом после его приобретения Покупателем:]
  parbreak()
  fld("указать либо написать «отсутствуют»", data.object.at("occupants", default: ""))

  heading("3. ЦЕНА И ПОРЯДОК РАСЧЁТОВ")
  [3.1. Цена объекта составляет #val(data.terms.at("price", default: "")) руб. (#val(data.terms.at("price_words", default: "")) рублей).]
  parbreak()
  [3.2. Порядок, способ и срок расчётов:]
  parbreak()
  fld("включая условия аккредитива / эскроу", data.terms.at("payment", default: ""))

  heading("4. ПЕРЕДАЧА ОБЪЕКТА")
  [4.1. Объект передаётся Покупателю по передаточному акту в срок и на условиях:]
  parbreak()
  fld("срок и дополнительные условия", data.terms.at("transfer", default: ""))
  parbreak()
  [4.2. Передача ключей, документов и показаний приборов учёта фиксируется в передаточном акте.]
  parbreak()
  [4.3. Состояние объекта, остающееся имущество и известные недостатки:]
  parbreak()
  fld("описание или ссылка на приложение", data.terms.at("condition", default: ""))

  heading("5. ЗАВЕРЕНИЯ И ГОСУДАРСТВЕННАЯ РЕГИСТРАЦИЯ")
  [5.1. Продавец подтверждает, что вправе распоряжаться объектом, а сведения об объекте, обременениях и правах третьих лиц, сообщённые им Покупателю, достоверны. Дополнительные заверения:]
  parbreak()
  fld("указать либо написать «нет»", data.terms.at("assurances", default: ""))
  parbreak()
  [5.2. Переход права собственности подлежит государственной регистрации в ЕГРН. Право собственности Покупателя возникает с момента внесения соответствующей записи в ЕГРН. Стороны обязуются подать необходимые документы и совершить требуемые от них действия.]
  parbreak()
  [5.3. Расходы по регистрации и нотариальному удостоверению (если оно требуется) несёт:]
  parbreak()
  fld("распределение расходов", data.terms.at("expenses", default: ""))

  heading("6. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ")
  [6.1. Договор вступает в силу с момента его подписания Сторонами. Изменения оформляются письменно и подписываются Сторонами.]
  parbreak()
  [6.2. Договор составлен в количестве экземпляров, равном числу Сторон, и, если требуется, дополнительном экземпляре для нотариуса или органа регистрации прав. Все экземпляры имеют равную юридическую силу.]
  parbreak()
  fld("Приложения", data.terms.at("appendices", default: ""))

  heading("7. АДРЕСА, РЕКВИЗИТЫ И ПОДПИСИ")
  for s in data.sellers { party("Продавец", s); v(0.25em); [Подпись: #signature(s)]; v(0.3em) }
  for b in data.buyers { party("Покупатель", b); v(0.25em); [Подпись: #signature(b)]; v(0.3em) }
  v(0.3em)
  align(center, text(size: 8pt, fill: rgb("7c6f64"))[Перед подписанием проверьте сведения ЕГРН, полномочия сторон и необходимость нотариального удостоверения.])
}
