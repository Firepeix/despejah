/*INIT*/

/**
 * Aqui o codigo é carregado, onde as funcões de inicialização estão
 */
onload = function () {
  setUp()
  goTo('home');
};

/**
 * Funções de inicialização
 */
function setUp () {
  window.params = {}
  Maska.create('.masked');
  SimpleMaskMoney.setMask('.money');
}

/**
 * Aqui é onde se inicializa os graficos, e é colocado na variavel global CHARTS
 */
function setUpCharts () {
  if (window.charts === undefined) {
    window.charts = { fixed: { color: '#0c59cf' }, variable: { color: '#e61610' }, eve: { color: '#606060' } }
    Object.keys(window.charts).forEach(function (chartId) {
      const element = document.querySelector('.chart#' + chartId);
      if (element !== null) {
        const context = element.getContext('2d')
        const color = window.charts[chartId].color;
        window.charts[chartId] = new Chart(context, {
          type: 'doughnut',
          plugins: [{
            id: 'text-in-donut',
            afterDraw: function (chart) {
              let theCenterText = window.charts[chartId].data.datasets[0].data[0].toFixed(0) + "%";
              const canvasBounds = element.getBoundingClientRect();
              const fontSz = Math.floor( canvasBounds.height * 0.18 ) ;
              chart.ctx.textBaseline = 'middle';
              chart.ctx.textAlign = 'center';
              chart.ctx.font = 'bold ' + fontSz + 'px Arial ';
              chart.ctx.fillStyle = color;
              chart.ctx.fillText(theCenterText, canvasBounds.width/1.9, canvasBounds.height * 0.53 )
            }
          }],
          options: {
            legend: {
              display:false
            },
            tooltips: {
              callbacks: {
                label: function (tooltipItem, data) {
                  return ' ' + data.labels[tooltipItem.index] + ': ' + data.datasets[0].data[tooltipItem.index] +'%'
                }
              }
            }
          },
          data: {
            datasets: [
              {
                data: [50, 50],
                backgroundColor: [
                  color,
                  'rgba(235, 235, 235, 1)',
                ],
              }],
            labels: ['Gasto', 'Restante']
          },
        });
      }

    })
  }
}

/*ROUTER*/

/**
 * Função de navegação onde ele desativa a
 * pagina previamente ativa e ativa a nova pagina
 */
function goTo (name, loadParams = {}) {
  window.params = loadParams
  reveal(name, 'page');
  reveal(name, 'title');
}

/**
 * Função de navegação onde ele limpa
 * os parametros de navegacao
 */
function cleanParams () {
  window.params = { }
}

/**
 * Função de navegação onde ele
 * revela o elemento HTML para o usuario
 */
function reveal (name, type) {
  const oldElement = document.querySelector('.' + type + '.active');
  if (oldElement !== null) {
    oldElement.classList.remove('active');
    if (type === 'page') {
      const disposed = onDisposed()[oldElement.id.replace('-page', '')];
      if (disposed !== undefined) {
        disposed();
      }
    }
  }
  const element = document.querySelector('.' + type + '#' + name + '-' + type);
  if (element !== null) {
    element.classList.add('active');
    if (type === 'page') {
      const mounted = onMounted()[name];
      if (mounted !== undefined) {
        mounted();
      }
    }
  }
}

/**
 * Função de navegação onde busca as
 * funções de montagem da pagina caso elas existam
 */
function onMounted () {
  return { home: onHomeMounted, 'new-expense': onNewExpenseMounted, expenses: onExpensesMounted, type: onTypesMounted };
}

/**
 * Função de navegação onde ele busca as
 * funções de desmontagem de uma pagina caso elas existam
 */
function onDisposed () {
  return { 'new-expense': onNewExpenseDisposed };
}

/*HELPERS*/

/**
 * Função que exibe o SweetAlert2 para o usuario de forma generica
 */
function coolAlert (type, title, message, time, onClose = null) {
  Swal.fire({
    title: title,
    text: message,
    showConfirmButton: false,
    icon: type,
    confirmButtonText: 'Cool',
    timer: time,
    willClose: onClose !== null ? onClose : function () {}
  });
}

/**
 * Função que exibe um alerta de sucesso para o usuario
 */
function successAlert (message, onClose = null) {
  coolAlert('success', 'Sucesso', message, 2000, onClose);
}

/**
 * Função que converte para inteiro o valor do parametro
 */
function toInt (value) {
  return Number(String(value).replace(/\D/g, ''));
}

/**
 * Função que converte para real o valor fornecido
 */
function toReal (value) {
  value = String((toInt(value) / 100).toFixed(2)).replace('.', ',').replace('-', '');
  if (value.length > 6) {
    value = value.slice(0, value.length - 6) + '.' + value.slice(value.length - 6);
  }
  return this.toInt() < 0 ? '-' + value : value;
}

/**
 * Função que converte entre dois padrões de data
 * o brasileiro e o internacional
 */
function toDate (date, type) {
  if (type === 'model') {
    return date.split('/').reverse().join('-');
  }

  return date.split('-').reverse().join('/');
}

/**
 * Função que valida dado input de acordo com um boleano previamente indicado
 * e coloca a razão do erro na tela do usuario
 */
function validate (rules) {
  let valid = true;
  cleanValidation();
  for (const index in rules) {
    if (rules.hasOwnProperty(index)) {
      const validate = rules[index];
      if (validate.check === false) {
        valid = false;
        showValidateError(validate.element, validate.error, validate.nested);
      }
    }
  }

  return valid;
}

/**
 * Função que limpa a validação previamente
 * inserida na tela do usuario
 */
function cleanValidation () {
  document.querySelectorAll('.error').forEach(function (error) {
    error.innerHTML = '';
  });
}

/**
 * Função que insere o erro da validação
 * em baixo do input
 */
function showValidateError (input, text, nested = 1) {
  let parentElement = input;
  for (let i = 0; i < nested; i++) {
    parentElement = parentElement.parentNode;
  }
  const error = parentElement.querySelector('.error');
  if (error !== null) {
    error.innerHTML = text;
  }

}

/**
 * Função que troca o botão principal
 * no centro da tela
 */
function toggleMainButton (id) {
  const oldElement = document.querySelector('.main.active');
  if (oldElement !== null) {
    oldElement.classList.remove('active');
  }
  const element = document.querySelector('.main#' + id);
  if (element !== null) {
    element.classList.add('active');
  }
}

/*MENU*/
/**
 * Função que abre/fecha o menu de dropdown para
 * exibir as opçoes
 */
function toggleMenu (menu, self = null) {
  let parent = document;
  if (self !== null) {
    parent = self.parentNode;
  }
  menu = parent.querySelector('.menu#' + menu)
  if (menu !== null) {
    menu.classList.toggle('closed')
  }
}

/*HOME*/

/**
 * Função de inicialização da Home
 */
function onHomeMounted () {
  const expenses = getExpenses();
  setUpCharts()
  if (expenses.length > 0) {
    constructHome(expenses, getExpenseTypes())
    return;
  }
  goTo('none-home');
}

/**
 * Função que constroe a home buscando dados
 */
function constructHome (expenses = null, types) {
  makeThreeBiggestExpenses(getThreeBiggestExpenses(expenses), getExpenseTypes(true));
  const budgets = calculateBudgets(expenses, types)
  makeStatus(budgets)
  applyBudgets(budgets)
}

/**
 * Função que aplica os budgets (orçamentos)
 * na home
 */
function applyBudgets (budgets) {
  budgets.forEach(function (budget) {
    window.charts[budget.chartId].data.datasets[0].data[0] = budget.filledPercentage > 100 ? 100 : budget.filledPercentage
    window.charts[budget.chartId].data.datasets[0].data[1] = budget.filledPercentage > 100 ? 0 : 100 - budget.filledPercentage
    window.charts[budget.chartId].update()
  })
}

/**
 * Função que insere as 3 maiores depespesas
 * na home
 */
function makeThreeBiggestExpenses (expenses, types) {
  const template = document.querySelector('.template.expense-resume');
  const body = document.querySelector('#biggest-body-table');
  if (template !== null && body !== null) {
    body.innerHTML = ''
    expenses.forEach(function (expense) {
      const expenseElement = template.cloneNode(true)
      expenseElement.classList.remove('template');
      expenseElement.setAttribute('data-id', expense.id)
      expenseElement.querySelector('.name').innerHTML = expense.name
      expenseElement.querySelector('.amount').innerHTML = 'R$ ' + toReal(expense.amount)
      expenseElement.querySelector('.icon').src = '/src/icons/expense-types/' + types[expense.typeId].icon + '.svg'
      body.appendChild(expenseElement)
    })
  }
}

/**
 * Função que verifica o calculo dos
 * orcamentos e fala se passou ou não do orçamento
 */
function makeStatus(budgets) {
  const hasOverflow = budgets.filter(function (budget) {
    return budget.overflow
  }).length > 0;

  revealStatus(hasOverflow ? 'negative' : 'success')
}

/**
 * Função que revela o status dos orçamentos
 * para o usuario
 */
function revealStatus (type) {
  const oldElement = document.querySelector('.status.active');
  if (oldElement !== null) {
    oldElement.classList.remove('active');
  }
  const element = document.querySelector('.status.' + type);
  if (element !== null) {
    element.classList.add('active');
  }
}


/*EXPENSES*/

/**
 * Função que inicializa a tela de despesas
 */
function onExpensesMounted () {
  constructExpenses();
}

/**
 * Função que constroe a tela despesas
 */

function constructExpenses () {
  const expenses = getExpenses()
  if (expenses.length < 1) {
    goTo('none-home');
    return
  }
  setExpenses(getExpenses(), getExpenseTypes(true));
}

/**
 * Função que insere na tela de despesas
 * as despesas
 */
function setExpenses (expenses, types) {
  const template = document.querySelector('.expense.template');
  const list = document.querySelector('#expenses-page .list');
  if (template !== null && list !== null) {
    list.innerHTML = ''
    expenses.forEach(function (expense) {
      const expenseElement = template.cloneNode(true)
      expenseElement.classList.remove('template');
      expenseElement.setAttribute('data-id', expense.id)
      expenseElement.querySelector('.name').innerHTML = expense.name
      expenseElement.querySelector('.date').innerHTML = toDate(expense.date)
      expenseElement.querySelector('.amount').innerHTML = 'R$ ' + toReal(expense.amount)
      expenseElement.querySelector('.type-name').innerHTML = types[Number(expense.typeId)].name
      expenseElement.querySelector('.icon').src = '/src/icons/expense-types/' + types[expense.typeId].icon + '.svg'
      expenseElement.querySelector('.update').onclick = function () {
        goTo('new-expense', { expense: expense, update: true })
      }
      expenseElement.querySelector('.delete').onclick = function () {
        deleteModel(expense.id, 'expenses')
        successAlert('Despesa deletada com sucesso', function () {
          constructExpenses()
        })
      }

      list.appendChild(expenseElement)
    })
  }
}

/*NEW EXPENSE*/

/**
 * Função que inicializa a tela de nova despesa
 */
function onNewExpenseMounted () {
  constructNewExpense();
}

/**
 * Função que desnecializa a tela de despesas
 */
function onNewExpenseDisposed () {
  deconstructNewExpense()
}

/**
 * Função que constroe a tela de nova despesa
 */

function constructNewExpense () {
  addTypeOptions(getExpenseTypes());
  toggleMainButton('submit-expense');
  loadSavedExpense()
}

/**
 * Função que deconstroi a tela despesas
 */

function deconstructNewExpense () {
  cleanInputs()
  toggleMainButton('main-button');
}

/**
 * Função que verifica se existe uma
 * despesa para editar e insere ela
 * na tela de nova despesa
 */
function loadSavedExpense () {
  if (params.update && params.expense !== undefined) {
    setSavedExpense(params.expense)
    cleanParams()
  }
}

/**
 * Função que insere na tela de nova despesa
 * as possiveis categorias
 */
function addTypeOptions (types) {
  const select = document.querySelector('select#expense-type');
  if (select !== null) {
    select.innerHTML = '';
    select.appendChild(new Option('Selecionar Categoria'));
    types.forEach(type => {
      select.appendChild(new Option(type.name, type.id));
    });
  }
}

/**
 * Função que insere na tela de nova despesa
 * uma despesa para ser editada
 */
function setSavedExpense (expense) {
  const inputs = getInputs()
  inputs.nameInput.value = expense.name
  inputs.typeInput.value = expense.typeId
  inputs.dateInput.value = toDate(expense.date)
  inputs.amountInput.value = toReal(expense.amount)
  const form = document.querySelector('#new-expense-form')
  form.setAttribute('data-id', expense.id)
  form.setAttribute('update', 'true')
}

/**
 * Função que limpa as inputs da tela de nova despesa
 */
function cleanInputs () {
  const inputs = getInputs()
  inputs.nameInput.value = ''
  inputs.typeInput.value = ''
  inputs.dateInput.value = ''
  inputs.amountInput.value = '0,00'
}

/**
 * Função que busca as inputs da tela
 * de nova despesa
 */

function getInputs () {
  return {
    nameInput: document.querySelector('#expense-name'),
    typeInput: document.querySelector('#expense-type'),
    dateInput: document.querySelector('#expense-date'),
    amountInput: document.querySelector('#expense-amount')
  };
}

/**
 * Função que submete o formulario de nova
 * despesa e cria ela caso seja validada
 */

function submitExpense () {
  const inputs = getInputs()
  const form = document.querySelector('#new-expense-form')

  if (validate(getValidationRules(inputs))) {
    let id = null;
    if (form.getAttribute('update') === 'true') {
      id = Number(form.getAttribute('data-id'))
    }
    saveExpense(makeExpense(id, inputs.nameInput.value, inputs.typeInput.value, inputs.dateInput.value, inputs.amountInput.value));
  }
}

/**
 * Função que busca as regras de validacao
 * de uma nova despesa dada suas inputs
 */
function getValidationRules (inputs) {
  return [
    { element: inputs.nameInput, check: inputs.nameInput.value !== '', error: 'Por favor preencha o nome da despesa!' },
    { element: inputs.dateInput, check: inputs.dateInput.value !== '', error: 'Por favor preencha a data que a despesa ocorreu!' },
    { element: inputs.dateInput, check: validateDate(inputs.dateInput.value), error: 'Por favor preencha com uma data valida e no passado!' },
    { element: inputs.typeInput, check: !isNaN(inputs.typeInput.value), error: 'Por favor selecione uma categoria!' },
    { element: inputs.amountInput, check: toInt(inputs.amountInput.value) > 0, error: 'A despesa deve ter o valor maior que 0!', nested: 2 }
  ];
}

/**
 * Função que valida se a data da despesa esta valida
 */
function validateDate (date) {
  if (date !== '') {
    const inputDate = new Date(toDate(date, 'model') + ' 00:00:00')
    if (String(inputDate) === 'InvalidDate') {
      return false;
    }
    return inputDate <= new Date();
  }
  return true;
}

/*EXPENSE TYPES*/


/**
 * Função que inicializa a tela de gerenciamento de categorias
 */
function onTypesMounted () {
  constructTypes();
}

/**
 * Função que constroe a tela de gerenciamento de categorias
 */
function constructTypes () {
  setExpensesTypes(getExpenseTypes());
}

/**
 * Função que insere as categorias na tela de gerenciamento
 */
function setExpensesTypes (types) {
  const template = document.querySelector('.expense-type.template');
  const list = document.querySelector('#type-page .list');
  if (template !== null && list !== null) {
    list.innerHTML = ''
    types.forEach(function (type) {
      const expenseElement = template.cloneNode(true)
      expenseElement.classList.remove('template');
      expenseElement.setAttribute('data-id', type.id)
      expenseElement.querySelector('.name').innerHTML = type.name
      expenseElement.querySelector('.limit').innerHTML = toReal(type.limit)
      expenseElement.querySelector('.icon').src = '/src/icons/expense-types/' + type.icon + '.svg'
      expenseElement.querySelector('.update').onclick = function () {
        openUpdateTypeLimitModal(type)
      }
      list.appendChild(expenseElement)
    })
  }
}

/**
 * Função que abre o dialogo para alteracao de limite da categoria
 */
function openUpdateTypeLimitModal (type) {
  Swal.fire({
    title: 'Insira novo limite.',
    input: 'text',
    inputValue: toReal(type.limit),
    inputAttributes: {
      inputmode: 'numeric'
    },
    showCancelButton: true,
    confirmButtonText: 'Salvar',
    cancelButtonText: 'Cancelar',
    didOpen: function () {
      SimpleMaskMoney.setMask('.swal2-input');
    }
  }).then(function (result) {
    if (result.isConfirmed) {
      updateTypeLimit(type, toInt(result.value))
    }
  })
}

/**
 * Função que atualiza o limite da categoria
 */
function updateTypeLimit(type, newLimit) {
  type.limit = newLimit
  updateModel(type, 'expense-types')
  successAlert('Limite editado com sucesso', function () {
    goTo('type')
  })
}


/*BACKEND*/

/**
 * Função que calcula os orçamentos baseados nas
 * categorias de despesas e despesas
 */
function calculateBudgets (expenses, types) {
  const budgets = []
  types.forEach(function (type) {
    const budget = createBudget(type, expenses.filter(function (expense) {
      return type.id === Number(expense.typeId)
    }))
    budgets.push(budget)
  })

  return budgets;
}

/**
 * Função que cria um orçamento de uma categoria
 */
function createBudget(type, expenses) {
  const expended = expenses.reduce(function (value, expense) {
    return value + expense.amount
  }, 0)

  return {
    typeId: type.id,
    expenses: expenses,
    limit: type.limit,
    expended: expended,
    overflow: type.limit < expended,
    filledPercentage: (expended  * 100) / type.limit,
    chartId: type.chartId
  }
}

/**
 * Função que verifica se uma entidade já existe salva
 */
function exists (model) {
  return model.id !== 0 && model.id !== undefined && model.id !== null;
}

/**
 * Função que busca despesas salvas
 */
function getExpenses () {
  return getModels('expenses').reverse();
}

/**
 * Função que busca as 3 maiores despesas salvas
 */
function getThreeBiggestExpenses (expenses = null) {
  let sortedExpenses = expenses === null ? getModels('expenses') : expenses
  sortedExpenses = sortedExpenses.sort(function (expenseA, expenseB) {
    return expenseA.amount > expenseB.amount ? -1 : 1
  })

  return sortedExpenses.slice(0, 3)
}

/**
 * Função que salva uma despesa no localStorage
 */
function saveExpense (expense) {
  if (exists(expense)) {
    updateModel(expense, 'expenses')
    successAlert('Despesa editada com sucesso', function () {
      goTo('expenses')
    })
    return;
  }

  insertModel(expense, 'expenses');
  successAlert('Despesa salva com sucesso!', function () {
    goTo('home')
  });
}

/**
 * Função que cria uma entidade de despesa
 */
function makeExpense (id = null, name, typeId, date, amount) {
  amount = isNaN(amount) ? toInt(amount) : amount;
  date = date.match(/\d{4}-\d{2}-\d{2}/) ? date : toDate(date, 'model');
  return { id: id, name: name, typeId: typeId, date: date, amount: amount };
}

/**
 * Função que busca as categorias de despesas
 */
function getExpenseTypes (hash = false) {
  let expenseTypes = getModels('expense-types');
  if (expenseTypes.length < 1) {
    expenseTypes = getDefaultExpenseTypes();
  }
  if (hash) {
    const map = {}
    expenseTypes.forEach(function (type) {
      map[type.id] = type
    })
    return map;
  }

  return expenseTypes;
}

/**
 * Função que busca as categorias pre-salvas
 */
function getDefaultExpenseTypes () {
  const types = [
    { id: 1, name: 'Fixas', icon: 'food-fork-drink', limit: 60000, chartId: 'fixed' },
    { id: 2, name: 'Variáveis', icon: 'car', limit: 30000, chartId: 'variable' },
    { id: 3, name: 'Eventuais', icon: 'tag', limit: 40000, chartId: 'eve' }
  ];

  types.forEach(function (type) {
    insertModel(type, 'expense-types')
  })

  return types;
}

/**
 * Função que gera um id unico para salvar no banco
 */
function generateId (string) {
  let hash = 0;
  if (string.length === 0) {
    return hash;
  }
  string += +new Date();
  for (let i = 0; i < string.length; i++) {
    let charCode = string.charCodeAt(i);
    hash = ((hash << 7) - hash) + charCode;
    hash = hash & hash;
  }

  return hash > 0 ? hash : hash * -1;
}

/**
 * Função que insere uma entidade no localStorage
 */
function insertModel (model, table) {
  const models = getModels(table);
  model.id = model.id !== undefined && model.id !== null ? model.id : generateId(JSON.stringify(model));
  models.push(model);
  localStorage.setItem(table, JSON.stringify(models));
}

/**
 * Função que atualiza uma entidade no localStorage
 */
function updateModel (model, table) {
  const models = getModels(table);
  const modelPos = models.findIndex(function (expense) {
    return expense.id === model.id
  })

  if (modelPos !== -1) {
    models[modelPos] = model
    localStorage.setItem(table, JSON.stringify(models));
  }
}

/**
 * Função que deleta uma entidade no localStorage
 */
function deleteModel (id, table) {
  let models = getModels(table);
  models = models.filter(function (expense) {
    return expense.id !== id
  })

  localStorage.setItem(table, JSON.stringify(models));
}

/**
 * Função que busca entidades no localStorage
 */
function getModels (table) {
  return localStorage.getItem(table) === null ? [] : JSON.parse(localStorage.getItem(table));
}

navigator.serviceWorker.register('./despeja-sevice-worker.js');
