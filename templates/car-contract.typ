// Официальный образец ДКП транспортного средства; рекламный блок и QR-код исключены.
#set page(paper: "a4", margin: (x: 1.75cm, y: 1.25cm), numbering: "1")
#set text(font: "New Computer Modern", size: 9pt, lang: "ru", fill: rgb("000000"))
#set par(justify: true, leading: 0.36em, spacing: 0.16em)

#let val(v) = if v == "" or v == none { line(length: 10em, stroke: 0.45pt) } else { str(v) }
#let section(title) = align(center)[#strong[#title]]

#let doc(data: none) = {
  let seller = data.sellers
  let buyer = data.buyers
  let terms = data.terms
  let vehicle = data.vehicle

  align(center)[ДОГОВОР КУПЛИ-ПРОДАЖИ ТРАНСПОРТНОГО СРЕДСТВА]
  v(0.45em)
  grid(columns: (1fr, 1fr), gutter: 1em)[г. #val(terms.at("place", default: ""))][#align(right)[#val(terms.at("date", default: "")) г.]]
  v(0.5em)
  [#val(seller.at("fio", default: "")), далее именуемый "Продавец", с одной стороны, и #val(buyer.at("fio", default: "")), далее именуемый "Покупатель", с другой стороны, совместно в дальнейшем именуемые "Стороны", заключили настоящий договор (далее - Договор) о нижеследующем:]

  v(0.35em)
  section("1. Предмет Договора. Общие положения")
  v(0.3em)
  [1.1. Продавец обязуется передать в собственность Покупателя, а Покупатель обязуется принять и оплатить ранее бывшее в эксплуатации следующее транспортное средство (далее — транспортное средство):]
  v(0.25em)
  pad(left: 1.2cm)[
    #text("-") государственный регистрационный знак: #val(vehicle.at("plate", default: "")); #linebreak()
    #text("-") идентификационный номер (VIN): #val(vehicle.at("vin", default: "")); #linebreak()
    #text("-") марка, модель: #val(vehicle.at("model", default: "")); #linebreak()
    #text("-") наименование (тип ТС): #val(vehicle.at("type", default: "")); #linebreak()
    #text("-") категория ТС (ABCD, прицеп): #val(vehicle.at("category", default: "")); #linebreak()
    #text("-") год выпуска: #val(vehicle.at("year", default: "")); #linebreak()
    #text("-") модель, № двигателя: #val(vehicle.at("engine", default: "")); #linebreak()
    #text("-") шасси (рама) №: #val(vehicle.at("chassis", default: "")); #linebreak()
    #text("-") кузов (кабина, прицеп) №: #val(vehicle.at("body", default: "")); #linebreak()
    #text("-") цвет: #val(vehicle.at("color", default: "")); #linebreak()
    #text("-") мощность двигателя, кВт (мин)/л.с.: #val(vehicle.at("power", default: "")); #linebreak()
    #text("-") рабочий объём двигателя, куб. см: #val(vehicle.at("displacement", default: "")); #linebreak()
    #text("-") экологический класс: #val(vehicle.at("eco_class", default: "")); #linebreak()
    #text("-") технически допустимая масса, кг: #val(vehicle.at("max_mass", default: "")); #linebreak()
    #text("-") иные индивидуализирующие признаки (голограммы, рисунки и т.д.): #val(vehicle.at("individual_features", default: "")); #linebreak()
  ]
  parbreak()
  v(0.12em)
  [#linebreak() Паспорт транспортного средства¹ (далее - ПТС) #val(vehicle.at("pts", default: "")), выдан #val(vehicle.at("pts_issued", default: "")).]
  parbreak()
  v(0.12em)
  [#linebreak() 1.2. Принадлежность Продавцу транспортного средства на момент подписания Договора подтверждается ПТС, а также свидетельством о регистрации транспортного средства (техническим паспортом) серии #val(vehicle.at("sts", default: "")), выдано (кем и когда) #val(vehicle.at("sts_issued", default: "")).]
  parbreak()
  v(0.12em)
  [#linebreak() 1.3. Покупатель заключает Договор, основываясь на достоверности, полноте и актуальности следующих представленных Продавцом сведений:]
  parbreak()
  [#linebreak() #text("-") Продавец является собственником транспортного средства.]
  parbreak()
  [#linebreak() #text("-") транспортное средство не является предметом обязательств Продавца перед третьими лицами, в том числе не является предметом залога, в отношении транспортного средства не наложен запрет на совершение регистрационных действий, транспортное средство не находится под арестом, не числится в базах данных МВД России как угнанное или похищенное транспортное средство и не имеет иных обременений.]
  parbreak()
  [#linebreak() #text("-") если транспортное средство было приобретено Продавцом в браке, Продавец гарантирует, что его супруг (а) не возражает против отчуждения имущества на условиях Договора.]
  parbreak()
  v(0.1em)
  [В случае нарушения гарантий, указанных в п.1.3 настоящего Договора, Продавец обязуется незамедлительно возвратить Покупателю стоимость транспортного средства в полном объеме со дня обнаружения соответствующего нарушения.]

  v(0.25em)
  section("2. Цена, срок и порядок оплаты")
  v(0.2em)
  [2.1. Цена транспортного средства составляет #val(terms.at("price", default: "")) (#val(terms.at("price_words", default: ""))) руб. (НДС не облагается). Оплата стоимости транспортного средства производится наличным или безналичным расчётом.]
  v(0.2em)
  [2.2. Передача транспортного средства осуществляется Продавцом в момент передачи Покупателем Продавцу денежных средств в счёт оплаты стоимости транспортного средства.]

  v(0.25em)
  section("3. Заключительные положения")
  v(0.2em)
  [Настоящий Договор вступает в силу после его подписания Сторонами и действует до момента полного исполнения Сторонами своих обязательств.]

  v(0.25em)
  section("4. Адреса и реквизиты Сторон")
  v(0.12em)
  table(
    columns: (1fr, 1fr),
    inset: 5pt,
    stroke: none,
    [Продавец #val(seller.at("fio", default: ""))], [Покупатель #val(buyer.at("fio", default: ""))],
    [Дата рождения #val(seller.at("birthdate", default: ""))], [Дата рождения #val(buyer.at("birthdate", default: ""))],
    [Паспорт #text("__") серия #val(seller.at("passport_series", default: "")) #text("__") номер #val(seller.at("passport_number", default: "")),], [Паспорт #text("__") серия #val(buyer.at("passport_series", default: "")) #text("__") номер #val(buyer.at("passport_number", default: "")),],
    [выдан #val(seller.at("passport_issued", default: "")), к/п #val(seller.at("passport_code", default: "")), дата выдачи #val(seller.at("passport_date", default: ""))], [выдан #val(buyer.at("passport_issued", default: "")), к/п #val(buyer.at("passport_code", default: "")), дата выдачи #val(buyer.at("passport_date", default: ""))],
    [Адрес регистрации: #val(seller.at("address", default: ""))], [Адрес регистрации: #val(buyer.at("address", default: ""))],
    [Телефон: #val(seller.at("phone", default: ""))], [Телефон: #val(buyer.at("phone", default: ""))],
    [Денежные средства в сумме #val(terms.at("price", default: "")) руб. получил], [Транспортное средство получил],
    [(подпись) #linebreak() #text("/") #line(length: 4cm, stroke: 0.5pt) #text("/") #linebreak() (ФИО)], [(подпись) #linebreak() #text("/") #line(length: 4cm, stroke: 0.5pt) #text("/") #linebreak() (ФИО)],
  )
  v(0.15em)
  v(0.1em)
  align(left, text(size: 8pt)[¹ С 1 ноября 2020 года введён электронный ПТС.])
}
