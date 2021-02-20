// BUDGET CONTROLLER
var budgetController = (function(){

	// some co
	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};



	Expense.prototype.calcPercentage = function(totalIncome){
		if(totalIncome >0){

		this.percentage = Math.round((this.value / totalIncome) * 100);

		}else{
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};

	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};


	calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(curr){
			sum += curr.value;
		});
		data.totals[type] = sum;
	}

	var data = {
		allItems:{
			exp: [],
			inc: [],
		},
		totals:{
			exp: 0,
			inc: 0,
		},
		budget: 0,
		percentage: -1
	};

	return {

		addItem: function(type, des,val){
			var newItem,ID;
			// CREATE NEW ID (id must be equal to last id +1)
			if(data.allItems[type].length === 0){
				ID = 0;
			}else {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			}
			// CREATE NEW ITEM based on 'inc' or 'exp'
			if(type === 'exp'){
				var newItem = new Expense(ID, des, val);
			}else if (type === 'inc') {
				var newItem = new Income(ID, des, val);
			}
			// Push it to our data structure
			data.allItems[type].push(newItem)
			//return the new element
			return newItem;
		},

		deleteItem: function(type, id){
			var ids, index;

			//looping to a newly created array with the ids, and returning the real id
			ids = data.allItems[type].map(function(current){
				return current.id;
			});
			index = ids.indexOf(id);

			if(index !== -1 ){

				data.allItems[type].splice(index, 1)

			}
		},

		testing: function(){
				console.log(data);
		},

		calculateBudget: function(){

			// calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			//calculate the budget: income- expenses
			data.budget = data.totals.inc - data .totals.exp;

			//calculate the percentage of income that we spent
			if(data.totals.inc >0){

			data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
			}else{
				data.percentage = -1;
			}

		},

		calculatePercentages: function(){

			data.allItems.exp.forEach(function(curr){

				curr.calcPercentage(data.totals.inc);

			});

		},

		getPercentages: function(){

			var allPerc = data.allItems.exp.map(function(curr){
				return curr.getPercentage();
			});
			return allPerc;

		},

		getBudget: function(){
			return{
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},



	}




})();

// UI CONTROLLER
var UIController = (function(){


	var DOMstrings = { // data structure to make changes easier if needed
		inputType:'.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn:'.add__btn',
		incomeContainer:'.income__list',
		expensesContainer:'.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentage: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel:'.budget__title--month'
	};

	var formatNumber = function(num, type){
			var numSplit;
			num = Math.abs(num);

			num = num.toFixed(2);

			numSplit = num.split('.');

			int = numSplit[0];

			if(int.length>3){
				int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 2310, output 2,310
			}

			dec = numSplit[1];

			return (type === 'exp' ? '-' : '+') + ' ' +int +'.'+ dec;

		};

	var nodeListForEach = function(list, callback){
				for(var i = 0; i < list.length; i++){
					callback(list[i], i)
				}
			};

	return {
		getInput: function(){
			return {
			type: document.querySelector(DOMstrings.inputType).value, //inc or exp
			description: document.querySelector(DOMstrings.inputDescription).value,
			value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
			}
		},
		getDOMstrings: function(){
			return DOMstrings;
		},
		addListItem: function(obj, type){
			var html, newHtml,element;
			// Create HTML string with placeholder text
			if( type === 'inc'){
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}else if(type === 'exp'){
				element = DOMstrings.expensesContainer;
				html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
			}

			// Replace the placeholdertect with data received from the object
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%',obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// Insert the html into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

		},

		deleteListItem: function(selectorID){

			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields:function(){
			var fields, fieldsArr;
			//transform list into array with slice method
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current, index, array){
				current.value = "";
			});

			fieldsArr[0].focus();

		},
		displayBudget: function(obj){


			obj.budget >= 0 ? type = 'inc': type = 'exp';
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if(obj.percentage > 0){
				document.querySelector(DOMstrings.percentage).textContent = obj.percentage + ' %';
			}else{
				document.querySelector(DOMstrings.percentage).textContent ='---';
			}

		},

		displayPercentages: function(percentages){

			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			nodeListForEach(fields,function(current, index){

				///
				if(percentages[index] > 0){
				current.textContent = percentages[index] + '%';
				}else{
					current.textContent = '---';
				}

			});


		},

		displayMonth: function(){
			var now,year,months, currentMonth, getMonth;
			//asd

			now = new Date();
			months = ['January','February','March','April','May','June','July','August', 'September','October','November','December'];
			getMonth = now.getMonth();
			year = now.getFullYear();
			currentMonth = months[getMonth];
			document.querySelector(DOMstrings.dateLabel).textContent = currentMonth+', '+year;
			console.log(currentMonth);
		},
		changedType: function(){

			var fields = document.querySelectorAll(
				DOMstrings.inputType + ','+
				DOMstrings.inputDescription +','+
				DOMstrings.inputValue
			);

			nodeListForEach(fields, function(cur){

				//
				cur.classList.toggle('red-focus');

			});


			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

		}

	}

})();



// GLOBAL APP CONTROLLER
var  controller = (function(budgetCtrl, UICtrl){

	var setupEventListeners= function(){
		var DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.querySelector(DOM.inputValue).addEventListener('keypress', function(event){
			if(event.keyCode === 13|| event.which=== 13 ){
				ctrlAddItem();
			}
		});
		document.querySelector(DOM.inputDescription).addEventListener('keypress', function(event){
			if(UICtrl.getInput().description){
				if(event.keyCode === 13|| event.which=== 13 ){
					document.querySelector(DOM.inputValue).focus();
					console.log('jas')
				}
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
	};

	var updatePercentages = function(){


		// 1. calculate the percentages
		budgetCtrl.calculatePercentages();

		// 2. Read percentage from the budget controller
		var percentages = budgetCtrl.getPercentages();

		// 3. Update the user interface with the new percentages.
		UICtrl.displayPercentages(percentages);

	};

	// create its own method to avoid repeating same code for updating budget
	var updateBudget = function(){

		// 1. Calculate the budget
		budgetCtrl.calculateBudget();
		// 2. Return the budget
		var  budget = budgetCtrl.getBudget();
		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};

	var ctrlAddItem = function(){
		var input, newItem;
		// 1. get input data
		input = UICtrl.getInput();

	if(input.description && input.value && input.value >=0) {

		// 2. add the item to the budget controller
		newItem = budgetCtrl.addItem(input.type, input.description, input.value);
		// 3. add the new item to the user interface
		UICtrl.addListItem(newItem,input.type);

		// 4. Clear the fields
		UICtrl.clearFields();

		// 5. Calculate and update budget
		updateBudget();

		// 6. Calculate percentages

		updatePercentages();


	}else{null};
	};

	var ctrlDeleteItem = function(event){
		var itemID, splitID, id, type;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if(itemID){

			// 1. convert the string (which contains the name of the class of the previusly created item of our list) into an array of elements;
			splitId = itemID.split('-');
			id = parseInt(splitId[1]);
			type = splitId[0];

			// 2. delete the item for the data structure
			budgetCtrl.deleteItem(type, id);
			// 3. delete the item from the ui
			UIController.deleteListItem(itemID);
			// 4 . update and show the new budget
			updateBudget();

			// 5. Calculate percentages

			updatePercentages();

		}

	};


	return {
		init: (function(){
					console.log('Application has started!.');
					setupEventListeners();
					updateBudget();
					UICtrl.displayMonth();
				})()
	};

})(budgetController, UIController);



