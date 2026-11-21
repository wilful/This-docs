// Договор купли-продажи автомобиля между физическими лицами (РФ).
// Условия передачи, расчётов и известного состояния должны быть заполнены
// сторонами с учётом фактических обстоятельств сделки.

#set page(paper: "a4", margin: (x: 2.2cm, y: 2cm), numbering: "1")
#set text(font: "New Computer Modern", size: 10.5pt, lang: "ru", fill: rgb("282828"))
#set par(justify: true, leading: 0.72em, spacing: 0.55em)
#set heading(numbering: none)

#let rule(color: rgb("d79921")) = line(length: 100%, stroke: (paint: color, thickness: 1.2pt))
#let value(v) = if v == "" or v == none { line(length: 7em, stroke: 0.5pt) } else { [#v] }
#let section(title) = [#v(0.7em)#text(size: 11pt, weight: "bold", fill: rgb("689d6a"))[#title]#v(0.25em)]
#let field(label, v) = [#text(weight: "medium")[#label:] #value(v)]
#let party(label, p) = {
  [#block(fill: rgb("f2ead3"), inset: 9pt, radius: 3pt)[
    #text(weight: "bold")[#label]
    #parbreak()
    #field("Ф.И.О.", p.at("fio", default: ""))
    #parbreak()
    #field("Паспорт (серия, номер, кем и когда выдан)", p.at("passport", default: ""))
    #parbreak()
    #field("Адрес регистрации", p.at("address", default: ""))
    #if p.at("phone", default: "") != "" { parbreak(); field("Телефон", p.at("phone", default: "")) }
  ]#v(0.45em)]
}
#let sign(label, p) = block(inset: 7pt, stroke: (paint: rgb("d5c4a1"), thickness: 0.5pt))[
  #text(weight: "bold")[#label: #p.at("fio", default: "")]
  #v(1.4em)
  [Подпись: #line(length: 5em, stroke: 0.5pt)]
]

#let doc(data: none) = {
  align(center)[
    text(size: 16pt, weight: "bold", tracking: 0.3pt)[ДОГОВОР]
    linebreak()
    text(size: 12pt, weight: "bold")[купли-продажи автомобиля]
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
  for (i, s) in data.sellers.enumerate() { party("Продавец " + str(i + 1), s) }
  text(weight: "bold")[Покупатель]
  for (i, b) in data.buyers.enumerate() { party("Покупатель " + str(i + 1), b) }

  section("2. ПРЕДМЕТ ДОГОВОРА")
  [2.1. Продавец обязуется передать в собственность Покупателя, а Покупатель принять и оплатить транспортное средство со следующими идентификационными данными:]
  v(0.2em)
  block(fill: rgb("f9f5e9"), inset: 9pt, radius: 3pt)[
    #field("Марка, модель", data.vehicle.at("model", default: ""))
    #parbreak()
    #field("VIN", data.vehicle.at("vin", default: ""))
    #parbreak()
    #field("Год выпуска", data.vehicle.at("year", default: ""))
    #parbreak()
    #field("Номер кузова (кабины, прицепа)", data.vehicle.at("body", default: ""))
    #parbreak()
    #field("Номер шасси / рамы", data.vehicle.at("chassis", default: ""))
    #parbreak()
    #field("Номер двигателя (если указан)", data.vehicle.at("engine", default: ""))
    #parbreak()
    #field("Цвет", data.vehicle.at("color", default: ""))
    #parbreak()
    #field("Государственный регистрационный знак", data.vehicle.at("plate", default: ""))
    #parbreak()
    #field("Пробег по одометру, км", data.vehicle.at("mileage", default: ""))
    #parbreak()
    #field("Паспорт транспортного средства (серия, номер / электронный ПТС)", data.vehicle.at("pts", default: ""))
    #parbreak()
    #field("Свидетельство о регистрации ТС", data.vehicle.at("sts", default: ""))
  ]
  [2.2. Сведения о собственнике и документе, на основании которого автомобиль принадлежит Продавцу:]
  parbreak()
  field("указать при необходимости", data.vehicle.at("ownership", default: ""))

  section("3. ЦЕНА И ПОРЯДОК РАСЧЁТОВ")
  [3.1. Цена автомобиля составляет #value(data.terms.at("price", default: "")) (#value(data.terms.at("price_words", default: ""))) рублей.]
  parbreak()
  [3.2. Порядок и срок оплаты:]
  parbreak()
  field("способ оплаты, срок и подтверждение расчёта", data.terms.at("payment", default: ""))
  parbreak()
  [Факт получения денежных средств подтверждается распиской Продавца или иным документом, если оплата не производится одновременно с подписанием договора.]

  section("4. ПЕРЕДАЧА АВТОМОБИЛЯ")
  [4.1. Продавец передаёт, а Покупатель принимает автомобиль, ключи и документы по передаточному акту / отметке ниже в срок:]
  parbreak()
  field("дата, время и место передачи", data.terms.at("transfer", default: ""))
  parbreak()
  [4.2. Состояние автомобиля, известные недостатки, повреждения, комплектность и передаваемое оборудование:]
  parbreak()
  field("описать подробно либо указать приложение", data.terms.at("condition", default: ""))
  parbreak()
  [4.3. Покупатель осмотрел автомобиль и получил возможность проверить его состояние. Подпись не ограничивает права Покупателя в отношении недостатков, о которых Продавец не сообщил и которые не могли быть выявлены при обычном осмотре.]
  parbreak()
  [4.4. Автомобиль и указанные документы переданы Покупателю:]
  parbreak()
  [Дата и время: #line(length: 5em, stroke: 0.5pt)    Подписи Сторон: #line(length: 4em, stroke: 0.5pt) / #line(length: 4em, stroke: 0.5pt)]

  section("5. ЗАВЕРЕНИЯ СТОРОН И РЕГИСТРАЦИЯ")
  [5.1. Продавец заверяет, что является собственником автомобиля и вправе им распоряжаться. Сведения об ограничениях, залоге, аресте и правах третьих лиц:]
  parbreak()
  field("указать либо написать «отсутствуют»", data.vehicle.at("restrictions", default: ""))
  parbreak()
  [5.2. Продавец сообщает о семейном положении и согласии супруга (если применимо):]
  parbreak()
  field("указать обстоятельства / реквизиты согласия", data.terms.at("spouse", default: ""))
  parbreak()
  [5.3. Покупатель обязуется обратиться за внесением изменений в регистрационные данные транспортного средства в установленный законодательством срок. Стороны предоставляют документы, необходимые для регистрационных действий.]

  section("6. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ")
  [6.1. Договор вступает в силу с момента подписания Сторонами. Изменения оформляются письменно и подписываются Сторонами.]
  parbreak()
  [6.2. Договор составлен в трёх экземплярах, имеющих равную юридическую силу: по одному для каждой Стороны и один для регистрационных действий.]
  parbreak()
  [6.3. Приложения к договору (при наличии):]
  parbreak()
  field("перечень", data.terms.at("appendices", default: ""))

  section("7. ПОДПИСИ СТОРОН")
  for s in data.sellers { sign("Продавец", s); v(0.4em) }
  for b in data.buyers { sign("Покупатель", b); v(0.4em) }
  v(1em)
  align(center, text(size: 8pt, fill: rgb("7c6f64"))[Перед сделкой проверьте личность Продавца, документы на автомобиль и сведения об ограничениях/залоге.])
}
