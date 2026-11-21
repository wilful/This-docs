// Договор купли-продажи объекта недвижимости. Универсальная заготовка для РФ.
// Перед подписанием проверьте необходимость нотариальной формы и специальных
// условий для долевой собственности, несовершеннолетних и обременений.

#set page(paper: "a4", margin: (x: 2.2cm, y: 2cm), numbering: "1")
#set text(font: "New Computer Modern", size: 10.5pt, lang: "ru", fill: rgb("282828"))
#set par(justify: true, leading: 0.72em, spacing: 0.55em)
#set heading(numbering: none)

#let rule(color: rgb("d79921")) = line(length: 100%, stroke: (paint: color, thickness: 1.2pt))
#let value(v) = if v == "" or v == none { line(length: 7em, stroke: 0.5pt) } else { [#v] }
#let section(title) = [#v(0.7em)#text(size: 11pt, weight: "bold", fill: rgb("689d6a"))[#title]#v(0.25em)]
#let field(label, v) = [#text(weight: "medium")[#label:] #value(v)]
#let party(role, n, p) = {
  [#block(fill: rgb("f2ead3"), inset: 9pt, radius: 3pt)[
    #text(weight: "bold")[#role #str(n)]
    #parbreak()
    #field("Ф.И.О.", p.at("fio", default: ""))
    #parbreak()
    #field("Паспорт (серия, номер, кем и когда выдан)", p.at("passport", default: ""))
    #parbreak()
    #field("Адрес регистрации", p.at("address", default: ""))
    #if p.at("phone", default: "") != "" { parbreak(); field("Телефон", p.at("phone", default: "")) }
    #if p.at("basis", default: "") != "" { parbreak(); field("Право собственности / основание", p.at("basis", default: "")) }
  ]#v(0.45em)]
}

#let doc(data: none) = {
  align(center)[
    text(size: 16pt, weight: "bold", tracking: 0.3pt)[ДОГОВОР]
    linebreak()
    text(size: 12pt, weight: "bold")[купли-продажи объекта недвижимости]
  ]
  v(0.45em)
  rule()
  v(0.65em)
  field("Место заключения", data.terms.at("place", default: ""))
  parbreak()
  field("Дата", data.terms.at("date", default: ""))

  [Граждане, указанные в разделе 1 настоящего договора, далее совместно именуемые «Стороны», заключили настоящий договор о нижеследующем.]

  section("1. СТОРОНЫ ДОГОВОРА")
  text(weight: "bold")[Продавец]
  for (i, s) in data.sellers.enumerate() { party("Продавец ", i + 1, s) }
  text(weight: "bold")[Покупатель]
  for (i, b) in data.buyers.enumerate() { party("Покупатель ", i + 1, b) }

  section("2. ПРЕДМЕТ ДОГОВОРА")
  [2.1. Продавец обязуется передать в собственность Покупателя, а Покупатель — принять и оплатить следующий объект недвижимости:]
  v(0.2em)
  block(fill: rgb("f9f5e9"), inset: 9pt, radius: 3pt)[
    #field("Вид объекта", data.object.at("object_type", default: ""))
    #parbreak()
    #field("Адрес (местоположение)", data.object.at("address", default: ""))
    #parbreak()
    #field("Площадь, кв. м", data.object.at("area", default: ""))
    #parbreak()
    #field("Кадастровый номер", data.object.at("cadastral", default: ""))
  ]
  [2.2. Объект принадлежит Продавцу на основании документа, указанного в разделе 1. Запись о государственной регистрации права:]
  parbreak()
  field("номер и дата записи ЕГРН", data.object.at("ownership", default: ""))
  parbreak()
  [2.3. Обременения, ограничения прав и притязания третьих лиц:]
  parbreak()
  field("указать либо написать «отсутствуют»", data.object.at("encumbrances", default: ""))
  parbreak()
  [2.4. Лица, сохраняющие в соответствии с законом право пользования объектом после его приобретения Покупателем:]
  parbreak()
  field("указать либо написать «отсутствуют»", data.object.at("occupants", default: ""))

  section("3. ЦЕНА И ПОРЯДОК РАСЧЁТОВ")
  [3.1. Цена объекта составляет #value(data.terms.at("price", default: "")) (#value(data.terms.at("price_words", default: ""))) рублей. Цена является согласованной Сторонами и изменяется только по их письменному соглашению.]
  parbreak()
  [3.2. Порядок и срок расчётов:]
  parbreak()
  field("способ, сроки, условия раскрытия аккредитива/эскроу и подтверждение оплаты", data.terms.at("payment", default: ""))

  section("4. ПЕРЕДАЧА ОБЪЕКТА")
  [4.1. Объект передаётся Покупателю по передаточному акту в срок и на условиях:]
  parbreak()
  field("срок и дополнительные условия", data.terms.at("transfer", default: ""))
  parbreak()
  [4.2. До подписания передаточного акта риск случайной гибели или повреждения объекта несёт Продавец, если иное не установлено законом. Передача ключей, показаний приборов учёта и документов фиксируется в акте.]
  parbreak()
  [4.3. Состояние объекта, имущество, остающееся в нём, и выявленные недостатки:]
  parbreak()
  field("описание либо ссылка на приложение", data.terms.at("condition", default: ""))

  section("5. ЗАВЕРЕНИЯ СТОРОН И РЕГИСТРАЦИЯ")
  [5.1. Продавец заверяет, что на дату подписания договора он вправе распоряжаться объектом, а сообщённые им сведения об объекте, правах третьих лиц и обременениях достоверны. Иные заверения и известные Сторонам обстоятельства:]
  parbreak()
  field("указать дополнительные условия", data.terms.at("assurances", default: ""))
  parbreak()
  [5.2. Переход права собственности подлежит государственной регистрации в Едином государственном реестре недвижимости. Стороны обязуются подать необходимые документы и совершить зависящие от них действия для регистрации. Право собственности Покупателя возникает с момента внесения записи в ЕГРН.]
  parbreak()
  [5.3. Расходы по государственной регистрации и нотариальному удостоверению (если оно требуется) несёт:]
  parbreak()
  field("указать распределение расходов", data.terms.at("expenses", default: ""))

  section("6. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ")
  [6.1. Договор вступает в силу с момента его подписания Сторонами. Изменения оформляются письменно и подписываются Сторонами.]
  parbreak()
  [6.2. Договор составлен в количестве экземпляров, равном числу его Сторон, и, если применимо, один экземпляр для органа регистрации прав / нотариуса. Все экземпляры имеют равную юридическую силу.]
  parbreak()
  [6.3. Приложения к договору (при наличии):]
  parbreak()
  field("перечень", data.terms.at("appendices", default: ""))

  section("7. АДРЕСА, РЕКВИЗИТЫ И ПОДПИСИ СТОРОН")
  for s in data.sellers {
    block(inset: 7pt, stroke: (paint: rgb("d5c4a1"), thickness: 0.5pt))[
      #text(weight: "bold")[Продавец: #s.at("fio", default: "")]
      #v(1.4em)
      [Подпись: #line(length: 5em, stroke: 0.5pt)]
    ]
    v(0.4em)
  }
  for b in data.buyers {
    block(inset: 7pt, stroke: (paint: rgb("d5c4a1"), thickness: 0.5pt))[
      #text(weight: "bold")[Покупатель: #b.at("fio", default: "")]
      #v(1.4em)
      [Подпись: #line(length: 5em, stroke: 0.5pt)]
    ]
    v(0.4em)
  }
  v(1em)
  align(center, text(size: 8pt, fill: rgb("7c6f64"))[Перед подписанием проверьте сведения ЕГРН, полномочия сторон и необходимость нотариального удостоверения.])
}
