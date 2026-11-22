// Официальный образец ДКП транспортного средства; рекламный блок и QR-код исключены.
#set page(
  paper: "a4",
  margin: (left: 0.45cm, right: 0.45cm, top: 0.2cm, bottom: 0.2cm),
  numbering: "1",
)
#set text(font: "New Computer Modern", size: 5.5pt, lang: "ru", fill: rgb("000000"))
#set par(justify: true, leading: 0.025em, spacing: 0em)

#let val(v) = if v == "" or v == none { text("________") } else { str(v) }
#let signature(p) = {
  let value = p.at("signature", default: "")
  if value == "" {
    line(length: 4cm, stroke: 0.5pt)
  } else {
    image(bytes(value), format: "svg", width: 3.5cm, height: 0.7cm, fit: "contain")
  }
}
#let section(title) = align(center)[#strong[#title]]

#let doc(data: none) = {
  let seller = data.sellers
  let buyer = data.buyers
  let terms = data.terms
  let vehicle = data.vehicle

  scale({
  align(center)[ДОГОВОР КУПЛИ-ПРОДАЖИ ТРАНСПОРТНОГО СРЕДСТВА]
  v(0em)
  grid(columns: (1fr, 1fr), gutter: 1em)[г. #val(terms.at("place", default: ""))][#align(right)[#val(terms.at("date", default: "")) г.]]
  v(0em)
  [#val(seller.at("fio", default: "")), далее именуемый "Продавец", с одной стороны, и #val(buyer.at("fio", default: "")), далее именуемый "Покупатель", с другой стороны, совместно в дальнейшем именуемые "Стороны", заключили настоящий договор (далее - Договор) о нижеследующем:]
  parbreak()
  section("1. Предмет Договора. Общие положения")
  parbreak()
  [1.1. Продавец обязуется передать в собственность Покупателя, а Покупатель обязуется принять и оплатить ранее бывшее в эксплуатации следующее транспортное средство (далее — транспортное средство):]
  parbreak()
  pad(left: 0.3cm)[
    #grid(columns: (1fr, 1fr), gutter: 0.4em,
      [#text("- государственный регистрационный знак: ") #val(vehicle.at("plate", default: ""))], [#text("- идентификационный номер (VIN): ") #val(vehicle.at("vin", default: ""))],
      [#text("- марка, модель: ") #val(vehicle.at("model", default: ""))], [#text("- наименование (тип ТС): ") #val(vehicle.at("type", default: ""))],
      [#text("- категория ТС (ABCD, прицеп): ") #val(vehicle.at("category", default: ""))], [#text("- год выпуска: ") #val(vehicle.at("year", default: ""))],
      [#text("- модель, N двигателя: ") #val(vehicle.at("engine", default: ""))], [#text("- шасси (рама) N: ") #val(vehicle.at("chassis", default: ""))],
      [#text("- кузов (кабина, прицеп) N: ") #val(vehicle.at("body", default: ""))], [#text("- цвет: ") #val(vehicle.at("color", default: ""))],
      [#text("- мощность двигателя, кВт (мин)/л.с.: ") #val(vehicle.at("power", default: ""))], [#text("- рабочий объем двигателя, куб. см: ") #val(vehicle.at("displacement", default: ""))],
      [#text("- экологический класс: ") #val(vehicle.at("eco_class", default: ""))], [#text("- технически допустимая масса, кг: ") #val(vehicle.at("max_mass", default: ""))],
    )
    [- иные индивидуализирующие признаки (голограммы, рисунки и т.д.): #val(vehicle.at("individual_features", default: ""))]
  ]
  [Паспорт транспортного средства¹ (далее - ПТС) #val(vehicle.at("pts", default: "")), выдан #val(vehicle.at("pts_issued", default: "")).]
  parbreak()
  [1.2. Принадлежность Продавцу транспортного средства на момент подписания Договора подтверждается ПТС, а также свидетельством о регистрации транспортного средства (техническим паспортом) серии #val(vehicle.at("sts", default: "")), выдано (кем и когда) #val(vehicle.at("sts_issued", default: "")).]
  parbreak()
  section("1.3. Покупатель заключает Договор, основываясь на достоверности, полноте и актуальности следующих представленных Продавцом сведений:")
  parbreak()
  [#text("-") Продавец является собственником транспортного средства.]
  parbreak()
  [#text("-") транспортное средство не является предметом обязательств Продавца перед третьими лицами, в том числе не является предметом залога, в отношении транспортного средства не наложен запрет на совершение регистрационных действий, транспортное средство не находится под арестом, не числится в базах данных МВД России как угнанное или похищенное транспортное средство и не имеет иных обременений.]
  parbreak()
  [#text("-") если транспортное средство было приобретено Продавцом в браке, Продавец гарантирует, что его супруг (а) не возражает против отчуждения имущества на условиях Договора.]
  parbreak()
  [В случае нарушения гарантий, указанных в п.1.3 настоящего Договора, Продавец обязуется незамедлительно возвратить Покупателю стоимость транспортного средства в полном объеме со дня обнаружения соответствующего нарушения.]
  parbreak()
  v(-0.2em)
  section("2. Цена, срок и порядок оплаты")
  parbreak()
  [2.1. Цена транспортного средства составляет #val(terms.at("price", default: "")) (#val(terms.at("price_words", default: ""))) руб. (НДС не облагается). Оплата стоимости транспортного средства производится наличным или безналичным расчетом.]
  parbreak()
  [2.2. Передача транспортного средства осуществляется Продавцом в момент передачи Покупателем Продавцу денежных средств в счет оплаты стоимости транспортного средства.]
  parbreak()
  [3. Заключительные положения. Настоящий Договор вступает в силу после его подписания Сторонами и действует до момента полного исполнения Сторонами своих обязательств.]
  parbreak()
  section("4. Адреса и реквизиты Сторон")
  parbreak()
  v(0em)
  grid(columns: (1fr, 1fr), gutter: 0.5em,
    [Продавец #val(seller.at("fio", default: ""))
    #linebreak() Дата рождения #val(seller.at("birthdate", default: ""))
    #linebreak() Паспорт: серия #val(seller.at("passport_series", default: "")), номер #val(seller.at("passport_number", default: ""))
    #linebreak() Выдан #val(seller.at("passport_issued", default: ""))
    #linebreak() Код #val(seller.at("passport_code", default: "")), дата выдачи #val(seller.at("passport_date", default: ""))
    #linebreak() Адрес регистрации: #val(seller.at("address", default: ""))
    #linebreak() Телефон: #val(seller.at("phone", default: ""))
    #linebreak() Денежные средства в сумме #val(terms.at("price", default: "")) руб. получил
    #linebreak() (подпись) /#signature(seller)/ (ФИО)],
    [Покупатель #val(buyer.at("fio", default: ""))
    #linebreak() Дата рождения #val(buyer.at("birthdate", default: ""))
    #linebreak() Паспорт: серия #val(buyer.at("passport_series", default: "")), номер #val(buyer.at("passport_number", default: ""))
    #linebreak() Выдан #val(buyer.at("passport_issued", default: ""))
    #linebreak() Код #val(buyer.at("passport_code", default: "")), дата выдачи #val(buyer.at("passport_date", default: ""))
    #linebreak() Адрес регистрации: #val(buyer.at("address", default: ""))
    #linebreak() Телефон: #val(buyer.at("phone", default: ""))
    #linebreak() Транспортное средство получил
    #linebreak() (подпись) /#signature(buyer)/ (ФИО)],
  )
  v(0em)
  align(left, text(size: 5pt)[¹ С 1 ноября 2020 года введён электронный ПТС.])
  }, x: 84%, y: 84%, reflow: true)
}
