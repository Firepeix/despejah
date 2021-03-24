/*INIT*/
onload = function () {
  //goTo('home');
  goTo('new-expense');
};

/*ROUTER*/
function goTo (name) {
  reveal(name, 'page');
  reveal(name, 'title');
}

function reveal (name, type) {
  const oldElement = document.querySelector('.' + type + '.active');
  if (oldElement !== null) {
    oldElement.classList.remove('active');
  }
  const element = document.querySelector('.' + type + '#' + name + '-' + type);
  if (element !== null) {
    element.classList.add('active');
    if (type === 'page') {
      const mounted = onMounted()[name];
      if(mounted !== undefined) {
        mounted()
      }
    }
  }
}

function onMounted () {
  return { home: onHomeMounted, 'new-expense': onNewExpenseMounted };
}

/*HELPERS*/

function dateMask (self) {
  let value = self.value.replace(/\D/g,'').slice(0, 10);
  if (value.length >= 5) {
    self.value = value.slice(0,2) + '/' + value.slice(2,4) + '/' + value.slice(4);
    return;
  }
  else if (value.length >= 3) {
    self.value = value.slice(0,2) + '/' + value.slice(2);
    return;
  }
  self.value = value
}

function amountMask (self) {
  let value = self.value.replace(/\D/g,'');
  if (value.slice(1, -1) === '00') {
    self.value = '0,0' + value.slice(-1);
    return;
  }
  if (value.slice(0, 2) === '00') {
    self.value = '0,' + value.slice(-2);
    return;
  }

  if (value.length === 3) {
    self.value = value.slice(0,1) + ',' + value.slice(1);
    return;
  }

  if (value.length > 3) {
    value =  value.slice(0, value.length - 2)  + ',' + value.slice(-2);
    if (value.slice(0, 1) === '0') {
      value = value.slice(1)
    }
    self.value = value;
    return;
  }

  if (value === '') {
    self.value = '0,00'
    return;
  }
  self.value = value
}

/*HOME*/
function onHomeMounted () {
  const expenses = getExpenses();
  if (expenses.length > 0) {
    return;
  }
  goTo('none-home')
}

/*NEW EXPENSE*/

function onNewExpenseMounted () {
  constructNewExpense()
}

function constructNewExpense () {
  addTypeOptions(getExpenseTypes())
}

function addTypeOptions (types) {
  const select = document.querySelector('select#expense-type')
  if (select !== null) {
    select.innerHTML = ''
    select.appendChild(new Option('Selecionar Categoria'))
    types.forEach(type => {
      select.appendChild(new Option(type.name, type.id))
    })
  }
}

/*BACKEND*/
function getExpenses () {
  const expenses = localStorage.getItem('expenses') === null ? [] : localStorage.getItem('expenses');
  return expenses.map(function (rawExpense) {
    return makeExpense(rawExpense.id, rawExpense.name, rawExpense.typeId, rawExpense.date, rawExpense.amount)
  });
}

function makeExpense (id, name, typeId, date, amount) {
  return { id: id, name: name, typeId: typeId, date: date, amount: amount };
}

function getExpenseTypes () {
  let expenseTypes = localStorage.getItem('expenses-types') === null ? [] : localStorage.getItem('expenses-types');
  if (expenseTypes.length < 1) {
    expenseTypes = getDefaultExpenseTypes()
  }
  return expenseTypes.map(function (rawExpenseType) {
    return makeExpenseType(rawExpenseType.id, rawExpenseType.name, rawExpenseType.icon)
  });
}

function getDefaultExpenseTypes () {
  return [
    { id: generateId('Alimentação-food-fork-drink'.toLowerCase()), name: 'Alimentação', icon: 'food-fork-drink'},
    { id: generateId('Transporte-car'.toLowerCase()), name: 'Transporte', icon: 'car'},
    { id: generateId('Saúde-heart'.toLowerCase()), name: 'Saúde', icon: 'heart'},
    { id: generateId('Outros-tag'.toLowerCase()), name: 'Outros', icon: 'tag'},
    ]
}

function makeExpenseType (id, name, icon) {
  return { id: id, name: name, icon: icon };
}

function generateId(string) {
  let hash = 0;
  if (string.length === 0) {
    return hash;
  }
  string += + new Date();
  for (let i = 0; i < string.length; i++) {
    let charCode = string.charCodeAt(i);
    hash = ((hash << 7) - hash) + charCode;
    hash = hash & hash;
  }

  return hash > 0 ? hash : hash * -1;
}
