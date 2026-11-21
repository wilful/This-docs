// Договор купли-продажи автомобиля между физическими лицами (РФ).
// Условия и фактическое состояние автомобиля должны быть проверены сторонами.
#set page(paper: "a4", margin: (x: 2.2cm, y: 1.8cm), numbering: "1")
#set text(font: "New Computer Modern", size: 10pt, lang: "ru", fill: rgb("282828"))
#set par(justify: true, leading: 0.55em, spacing: 0.35em)

#let rule() = line(length: 100%, stroke: (paint: rgb("d79921"), thickness: 1pt))
#let val(v) = if v == "" or v == none { line(length: 6em, stroke: 0.5pt) } else { str(v) }
#let fld(label, v) = [#strong[#label:] #val(v)]
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
]

#let doc(data: none) = {
  align(center)[
    #text(size: 16pt, weight: "bold")[ДОГОВОР]
    #linebreak()
    #text(size: 12pt, weight: "bold")[купли-продажи автомобиля]
  ]
  v(0.3em)
  rule()
  v(0.45em)
  grid(columns: (1fr, 1fr), gutter: 1em)[#fld("Место заключения", data.terms.at("place", default: ""))][#align(right)[#fld("Дата", data.terms.at("date", default: ""))]]
  [Граждане, указанные в разделе 1 настоящего договора, далее совместно именуемые «Стороны», заключили настоящий договор о нижеследующем.]

  heading("1. СТОРОНЫ ДОГОВОРА")
  for (i, s) in data.sellers.enumerate() { party("Продавец " + str(i + 1), s); v(0.2em) }
  for (i, b) in data.buyers.enumerate() { party("Покупатель " + str(i + 1), b); v(0.2em) }

  heading("2. ТРАНСПОРТНОЕ СРЕДСТВО")
  [2.1. Продавец обязуется передать в собственность Покупателя, а Покупатель — принять и оплатить автомобиль со следующими идентификационными данными:]
  block(fill: rgb("f9f5e9"), inset: 8pt, radius: 3pt)[
    #fld("Марка и модель", data.vehicle.at("model", default: ""))
    #parbreak()
    #fld("VIN", data.vehicle.at("vin", default: ""))
    #parbreak()
    #fld("Год выпуска", data.vehicle.at("year", default: ""))
    #parbreak()
    #fld("Номер кузова / кабины", data.vehicle.at("body", default: ""))
    #parbreak()
    #fld("Номер шасси / рамы", data.vehicle.at("chassis", default: ""))
    #parbreak()
    #fld("Номер двигателя (если указан)", data.vehicle.at("engine", default: ""))
    #parbreak()
    #fld("Цвет", data.vehicle.at("color", default: ""))
    #parbreak()
    #fld("Государственный регистрационный знак", data.vehicle.at("plate", default: ""))
    #parbreak()
    #fld("Пробег по одометру, км", data.vehicle.at("mileage", default: ""))
    #parbreak()
    #fld("ПТС (серия, номер / электронный ПТС)", data.vehicle.at("pts", default: ""))
    #parbreak()
    #fld("Свидетельство о регистрации ТС", data.vehicle.at("sts", default: ""))
  ]
  [2.2. Документ, на основании которого автомобиль принадлежит Продавцу:]
  parbreak()
  fld("вид, номер и дата документа", data.vehicle.at("ownership", default: ""))

  heading("3. ЦЕНА И ПОРЯДОК РАСЧЁТОВ")
  [3.1. Цена автомобиля составляет #val(data.terms.at("price", default: "")) руб. (#val(data.terms.at("price_words", default: "")) рублей).]
  parbreak()
  [3.2. Порядок, способ и срок оплаты:]
  parbreak()
  fld("способ оплаты, срок и подтверждение расчёта", data.terms.at("payment", default: ""))
  parbreak()
  [Получение оплаты подтверждается распиской Продавца или иным документом, если оплата не производится одновременно с подписанием договора.]

  heading("4. ПЕРЕДАЧА АВТОМОБИЛЯ")
  [4.1. Автомобиль, ключи и документы передаются Покупателю в срок и месте:]
  parbreak()
  fld("дата, время и место передачи", data.terms.at("transfer", default: ""))
  parbreak()
  [4.2. Состояние, известные недостатки, повреждения, комплектность и передаваемое оборудование:]
  parbreak()
  fld("описать либо указать приложение", data.terms.at("condition", default: ""))
  parbreak()
  [4.3. Покупатель осмотрел автомобиль и получил возможность проверить его состояние. Это не ограничивает права Покупателя в отношении недостатков, о которых Продавец не сообщил и которые нельзя было выявить при обычном осмотре.]
  parbreak()
  [4.4. Автомобиль и документы переданы Покупателю:]
  parbreak()
  [Дата и время: #line(length: 4em, stroke: 0.5pt)    Подписи: #line(length: 4em, stroke: 0.5pt) / #line(length: 4em, stroke: 0.5pt)]

  heading("5. ЗАВЕРЕНИЯ СТОРОН И РЕГИСТРАЦИЯ")
  [5.1. Продавец подтверждает, что вправе распоряжаться автомобилем. Сведения о залоге, аресте, ограничениях и правах третьих лиц:]
  parbreak()
  fld("указать либо написать «отсутствуют»", data.vehicle.at("restrictions", default: ""))
  parbreak()
  [5.2. Сведения о семейном положении Продавца и согласии супруга (если применимо):]
  parbreak()
  fld("указать обстоятельства / реквизиты согласия", data.terms.at("spouse", default: ""))
  parbreak()
  [5.3. Покупатель обязан обратиться за внесением изменений в регистрационные данные транспортного средства в срок, установленный законодательством.]

  heading("6. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ")
  [6.1. Договор вступает в силу с момента подписания Сторонами. Изменения оформляются письменно.]
  parbreak()
  [6.2. Договор составлен в трёх экземплярах равной юридической силы: по одному для каждой Стороны и один для регистрационных действий.]
  parbreak()
  fld("Приложения", data.terms.at("appendices", default: ""))

  heading("7. ПОДПИСИ СТОРОН")
  for s in data.sellers { party("Продавец", s); v(0.25em); [Подпись: #line(length: 5em, stroke: 0.5pt)]; v(0.3em) }
  for b in data.buyers { party("Покупатель", b); v(0.25em); [Подпись: #line(length: 5em, stroke: 0.5pt)]; v(0.3em) }
  v(0.3em)
  align(center, text(size: 8pt, fill: rgb("7c6f64"))[Перед сделкой проверьте документы на автомобиль и сведения о залоге и ограничениях.])
}
