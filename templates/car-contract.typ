// Договор купли-продажи транспортного средства.
// Официальный образец без рекламного блока и QR-кода.
#let val(v, n: 10) = if v == "" or v == none { text(range(n).map(i => "_").join("")) } else { str(v) }

#let signature(p) = {
  let value = p.at("signature", default: "")
  if value == "" {
    box(baseline: -0.35em, line(length: 4.4cm, stroke: 0.5pt))
  } else {
    image(bytes(value), format: "svg", width: 4.4cm, height: 1cm, fit: "contain")
  }
}

#let doc(data: none) = {
  set page(paper: "a4", margin: (x: 1.5cm, y: 1.1cm))
  set text(font: "New Computer Modern", size: 10.5pt, lang: "ru", fill: rgb("000000"))
  set par(justify: true, leading: 0.5em, spacing: 0.8em)

  let seller = data.sellers
  let buyer = data.buyers
  let terms = data.terms
  let vehicle = data.vehicle

  let heading(title) = align(center, strong(title))

  align(center, strong(text(size: 13pt)[ДОГОВОР КУПЛИ-ПРОДАЖИ ТРАНСПОРТНОГО СРЕДСТВА]))
  if data.at("_specimen", default: false) {
    v(0.15em)
    align(center, text(size: 8.5pt, fill: rgb("888888"))[ОБРАЗЕЦ ЗАПОЛНЕНИЯ — сформирован для предварительного ознакомления. Не является подписанным документом.])
  }
  v(0.6em)

  grid(columns: (1fr, 1fr))[
    г. #val(terms.at("place", default: ""), n: 8)
  ][
    #align(right)[#val(terms.at("date", default: ""), n: 8) г.]
  ]
  v(0.3em)

  [#val(seller.at("fio", default: "")), далее именуемый «Продавец», с одной стороны, и #val(buyer.at("fio", default: "")), далее именуемый «Покупатель», с другой стороны, совместно в дальнейшем именуемые «Стороны», заключили настоящий договор (далее — Договор) о нижеследующем:]
  parbreak()

  heading("1. Предмет Договора. Общие положения")
  parbreak()

  [1.1. Продавец обязуется передать в собственность Покупателя, а Покупатель обязуется принять и оплатить ранее бывшее в эксплуатации следующее транспортное средство (далее — транспортное средство):]
  parbreak()

  block(width: 100%, pad(left: 0.5cm)[
    #set par(justify: false, leading: 0.35em)
    #table(
      columns: (8.4cm, 1fr),
      inset: (x: 0pt, y: 1.2pt),
      stroke: none,
      align: (left, left),
      [— государственный регистрационный знак:], [#val(vehicle.at("plate", default: ""), n: 8)],
      [— идентификационный номер (VIN):], [#val(vehicle.at("vin", default: ""), n: 8)],
      [— марка, модель:], [#val(vehicle.at("model", default: ""), n: 8)],
      [— наименование (тип ТС):], [#val(vehicle.at("type", default: ""), n: 8)],
      [— категория ТС (ABCD, прицеп):], [#val(vehicle.at("category", default: ""), n: 8)],
      [— год выпуска:], [#val(vehicle.at("year", default: ""), n: 8)],
      [— модель, N двигателя:], [#val(vehicle.at("engine", default: ""), n: 8)],
      [— шасси (рама) N:], [#val(vehicle.at("chassis", default: ""), n: 8)],
      [— кузов (кабина, прицеп) N:], [#val(vehicle.at("body", default: ""), n: 8)],
      [— цвет:], [#val(vehicle.at("color", default: ""), n: 8)],
      [— мощность двигателя, кВт (мин)/л.с.:], [#val(vehicle.at("power", default: ""), n: 8)],
      [— рабочий объем двигателя, куб. см:], [#val(vehicle.at("displacement", default: ""), n: 8)],
      [— экологический класс:], [#val(vehicle.at("eco_class", default: ""), n: 8)],
      [— технически допустимая масса, кг:], [#val(vehicle.at("max_mass", default: ""), n: 8)],
    )
    — иные индивидуализирующие признаки (голограммы, рисунки и т.д.): #val(vehicle.at("individual_features", default: ""), n: 6)
  ])
  parbreak()

  [Паспорт транспортного средства¹ (далее — ПТС) #val(vehicle.at("pts", default: "")), выдан #val(vehicle.at("pts_issued", default: "")).]
  parbreak()

  [1.2. Принадлежность Продавцу транспортного средства на момент подписания Договора подтверждается ПТС, а также свидетельством о регистрации транспортного средства (техническим паспортом) серии #val(vehicle.at("sts", default: "")), выдано (кем и когда) #val(vehicle.at("sts_issued", default: "")).]
  parbreak()

  heading("1.3. Покупатель заключает Договор, основываясь на достоверности, полноте и актуальности следующих представленных Продавцом сведений:")
  parbreak()

  [— Продавец является собственником транспортного средства.]
  parbreak()

  [— транспортное средство не является предметом обязательств Продавца перед третьими лицами, в том числе не является предметом залога, в отношении транспортного средства не наложен запрет на совершение регистрационных действий, транспортное средство не находится под арестом, не числится в базах данных МВД России как угнанное или похищенное транспортное средство и не имеет иных обременений.]
  parbreak()

  [— если транспортное средство было приобретено Продавцом в браке, Продавец гарантирует, что его супруг (а) не возражает против отчуждения имущества на условиях Договора.]
  parbreak()

  [В случае нарушения гарантий, указанных в п. 1.3 настоящего Договора, Продавец обязуется незамедлительно возвратить Покупателю стоимость транспортного средства в полном объеме со дня обнаружения соответствующего нарушения.]
  parbreak()

  heading("2. Цена, срок и порядок оплаты")
  parbreak()

  [2.1. Цена транспортного средства составляет #val(terms.at("price", default: "")) (#val(terms.at("price_words", default: ""))) руб. (НДС не облагается). Оплата стоимости транспортного средства производится наличным или безналичным расчетом.]
  parbreak()

  [2.2. Передача транспортного средства осуществляется Продавцом в момент передачи Покупателем Продавцу денежных средств в счет оплаты стоимости транспортного средства.]
  parbreak()

  [3. Заключительные положения. Настоящий Договор вступает в силу после его подписания Сторонами и действует до момента полного исполнения Сторонами своих обязательств.]
  parbreak()

  heading("4. Адреса и реквизиты Сторон")
  parbreak()

  block(width: 100%)[
    #set text(size: 9.5pt)
    #set par(justify: false, leading: 0.35em)
    #grid(
      columns: (1fr, 1fr),
      column-gutter: 1.2em,
      [
        *Продавец* #val(seller.at("fio", default: ""))\
        Дата рождения: #val(seller.at("birthdate", default: ""), n: 7)\
        Паспорт: серия #val(seller.at("passport_series", default: ""), n: 7), номер #val(seller.at("passport_number", default: ""), n: 7)\
        Выдан: #val(seller.at("passport_issued", default: ""), n: 7)\
        Код: #val(seller.at("passport_code", default: ""), n: 7), дата выдачи: #val(seller.at("passport_date", default: ""), n: 7)\
        Адрес регистрации: #val(seller.at("address", default: ""), n: 7)\
        Телефон: #val(seller.at("phone", default: ""), n: 7)\
        Денежные средства в сумме #val(terms.at("price", default: "")) руб. получил\
        (подпись) #signature(seller) (ФИО)
      ],
      [
        *Покупатель* #val(buyer.at("fio", default: ""))\
        Дата рождения: #val(buyer.at("birthdate", default: ""), n: 7)\
        Паспорт: серия #val(buyer.at("passport_series", default: ""), n: 7), номер #val(buyer.at("passport_number", default: ""), n: 7)\
        Выдан: #val(buyer.at("passport_issued", default: ""), n: 7)\
        Код: #val(buyer.at("passport_code", default: ""), n: 7), дата выдачи: #val(buyer.at("passport_date", default: ""), n: 7)\
        Адрес регистрации: #val(buyer.at("address", default: ""), n: 7)\
        Телефон: #val(buyer.at("phone", default: ""), n: 7)\
        Транспортное средство получил\
        (подпись) #signature(buyer) (ФИО)
      ],
    )
  ]

  v(0.4em)
  text(size: 8pt)[¹ С 1 ноября 2020 года введён электронный ПТС.]
}
