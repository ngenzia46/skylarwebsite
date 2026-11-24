// All scenario inputs stay in this page. Nothing is stored or submitted.
(() => {
  const controls = document.getElementById('estimate-controls');
  const result = document.getElementById('estimate-result');
  const inputs = Array.from(controls.querySelectorAll('input'));

  function render() {
    const french = document.documentElement.lang === 'fr';
    if (inputs.some(input => !input.validity.valid)) {
      result.textContent = french
        ? 'Vérifiez les cinq valeurs pour afficher le résultat.'
        : 'Check all five values to see your estimate.';
      return;
    }
    const values = Object.fromEntries(inputs.map(input => [input.name, input.valueAsNumber]));
    const hours = values.cases * values.minutes / 60;
    const net = hours * values.rate - values.running;
    const locale = french ? 'fr-BE' : 'en-BE';
    const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' });
    const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
    let payback = french ? 'Coût initial non récupéré' : 'Setup cost is not recovered';
    if (values.setup === 0) {
      payback = french ? 'Aucun coût initial' : 'No setup cost';
    } else if (net > 0) {
      // Round away only floating-point noise at exact month boundaries.
      const months = Math.ceil(Number((values.setup / net).toPrecision(14)));
      payback = french ? number.format(months) + ' mois'
        : number.format(months) + (months === 1 ? ' month' : ' months');
    }
    const metrics = [
      [french ? 'Heures libérées par mois' : 'Hours released per month', number.format(hours)],
      [french ? 'Valeur nette mensuelle' : 'Net monthly capacity value', money.format(net)],
      [french ? 'Valeur nette sur un an' : 'First-year net value', money.format(net * 12 - values.setup)],
      [french ? 'Récupération du coût initial' : 'Setup payback', payback],
    ];
    const list = document.createElement('dl');
    for (const [label, value] of metrics) {
      const item = document.createElement('div');
      const term = document.createElement('dt');
      const amount = document.createElement('dd');
      term.textContent = label;
      amount.textContent = value;
      item.append(term, amount);
      list.append(item);
    }
    result.replaceChildren(list);
  }

  render();
  controls.hidden = false;
  controls.addEventListener('input', render);
  new MutationObserver(render).observe(document.documentElement, {
    attributes: true, attributeFilter: ['lang'],
  });
})();
