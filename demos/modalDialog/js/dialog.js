function Dialog() {
	var self = this;

	self.view = $('<div>', {
		id : 'dialog-wrapper'
	});
	var dialogView = $('<div>', {
		id : 'dialog',
		class : 'container'
	});
	var overlay = $('<div>', {
		id : 'overlay'
	});
	var header = $('<h1>');
	var text = $('<div>', {
		id : 'dialog-text'
	});
	var buttons = $('<div>', {
		id : 'dialog-buttons'
	});

	self.showConfirm = function(a) {
		var inp = a === undefined ? {} : a;
		var o = {
			title : inp['title'] !== undefined ? inp['title'] : "Title",
			text : inp['text'] !== undefined ? inp['text'] : "text",
			b1Text : inp['b1Text'] !== undefined ? inp['b1Text'] : "Yes",
			b2Text : inp['b2Text'] !== undefined ? inp['b2Text'] : "No",
			b1Callback : inp['b1Callback'],
			b2Callback : inp['b2Callback']
		}
		header.text(o['title']);
		text.text(o['text']);
		var buttonOne = $('<button>');
		buttonOne.text(o['b1Text']);
		var buttonTwo = $('<button>');
		buttonTwo.text(o['b2Text']);
		buttonOne.click(function() {
			self.hide();
			if (o['b1Callback'] !== undefined && typeof o['b1Callback'] == 'function') {
				o['b1Callback']();
			}
		});
		buttonTwo.click(function() {
			self.hide();
			if (o['b2Callback'] !== undefined && typeof o['b2Callback'] == 'function') {
				o['b2Callback']();
			}
		});
		buttons.append(buttonOne, ' ', buttonTwo);
		self.show();
	}

	self.show = function() {
		$('body').append(overlay);
		$('body').append(self.view);
		overlay.click(function() {
			self.hide();
		});
	}

	self.hide = function() {
		self.view.detach();
		overlay.detach();
		self.reset();
	}

	self.reset = function() {
		buttons.empty();
		text.empty();
		header.empty();
	}

	self.setup = function() {
		self.view.append(dialogView);
		dialogView.append(header, text, buttons);
	}
	self.setup();
}

function LogoutButton() {
	var self = this;

	self.view = $('#logout');
	self.setup = function() {
		self.view.click(function() {
			user = "";
			storage.set('user', "");
			loginScreen.show();
			salesScreen.reset();
			newSaleScreen.reset();
		});
	}
	self.show = function() {
		self.view.show();
	}
	self.hide = function() {
		self.view.hide();
	}
	self.setup();
}

function LoginScreen() {
	var self = this;

	// Load view variables
	self.view = $('#login-screen');
	var submitButton = $("#login-screen_form-submit");
	var inputUser = $("#login-screen_form-user");
	var errorBox = $('#login-screen_error');

	// Action locks
	var lock = {
		login : true
	};

	// Load constants
	var LOGIN_API = 'http://alexwendland.com/ncdm/fundraising/api/login.php';

	self.setup = function() {
		submitButton.click(function() {
			if (lock.login) {
				lock.login = false;
				errorBox.hide();
				var userName = inputUser.val();
				if (userName) {
					$.getJSON(LOGIN_API, {
						user : userName
					}).done(function(data) {
						if (data['success']) {
							storage.set('user', userName);
							user = userName;
							self.reset();
							salesScreen.show();
						} else {
							errorBox.show().html(data["reason"]);
						}
						lock.login = true;
					});
				}
			}
		});
	}

	self.show = function() {
		// Show login screen
		hideScreens();
		self.view.show();
	}

	self.hide = function() {
		self.view.hide();
	}

	self.reset = function() {
		errorBox.empty();
		errorBox.hide();
		inputUser.empty();
	}
	// Call setup on the view
	self.setup();
}

function SaleItem(id, name, email, phone) {
	var self = this;

	self.hash = hasher();
	self.id = id;
	self.name = name;
	self.email = email;
	self.phone = phone;

	// Load view variables
	self.view = $('<li>', {
		class : 'sales-screen_sale-item'
	});
	var nameView = $('<span>', {
		class : 'sales-screen_sale-item_name'
	}).text(name);
	var emailView = $('<span>', {
		class : 'sales-screen_sale-item_email'
	}).text(email);
	var phoneView = $('<span>', {
		class : 'sales-screen_sale-item_phone'
	}).text(phone);
	var deleteButton = $('<button>', {
		class : 'sales-screen_sale-item_del-button'
	}).text("Del");

	self.setup = function() {
		self.view.append(nameView, emailView, phoneView, deleteButton);
	}

	self.insert = function(parent) {
		parent.append(self.view);
		self.view.data('hash', self.hash);
	}

	self.setup();
}

function drop(a, i) {
	return a.splice($.inArray(i, a), 1);
}

function SalesScreen() {
	var self = this;

	// Action locks
	var lock = {
		newSale : true,
		toggleView : true,
		delSaleArr : Array()

	};

	// Load view variables
	self.view = $('#sales-screen');
	var headerView = $('#sales-screen_header');
	var salesList = $("#sales-screen_list");
	var newSaleButton = $('#sales-screen_new-sale-button');
	var toggleViewButton = $('#sales-screen_toggle-view-button');

	var isUserOnly = true;

	var saleItems = Array();

	var API_PAST_SALES = 'http://alexwendland.com/ncdm/fundraising/api/past_sales.php';
	var API_DEL_SALES = 'http://alexwendland.com/ncdm/fundraising/api/delete_sale.php';

	self.setup = function() {
		newSaleButton.click(function() {
			if (lock.newSale) {
				lock.newSale = false;
				self.reset();
				newSaleScreen.show();
				lock.newSale = true;
			}
		});
		toggleViewButton.click(function() {
			if (lock.toggleView) {
				lock.toggleView = false;
				isUserOnly = !isUserOnly;
				if (isUserOnly) {
					toggleViewButton.text('All');
				} else {
					toggleViewButton.text('Mine');
				}
				self.reset();
				self.loadData();
				lock.toggleView = true;
			}
		});
	}

	self.show = function() {
		// Show Sales Screen
		hideScreens();
		logout.show();
		self.view.show();
		self.loadData();
	}

	self.loadData = function(userOnly) {
		loadingView.insert(salesList);
		if (userOnly !== undefined) {
			isUserOnly = userOnly;
		} else {
			var userOnly = isUserOnly;
		}
		var apiArgs = userOnly ? {
			user : user
		} : {};
		$.getJSON(API_PAST_SALES, apiArgs).done(function(data) {
			if (data['success']) {
				if (data['result'] === "") {
					loadingView.remove();
					self.loadSalesItems();
				} else {
					var sales = JSON.parse(data['result']);
					loadingView.remove();
					$.each(sales, function(index, val) {
						saleItems.push(new SaleItem(val['id'], val['name'], val['email'], val['phone']));
						self.loadSalesItems();
					});
				}
			} else {
				alert(data['reason'] + data['errorMessage']);
			}
		}).fail(function() {
			alert('Error getting Sales data');
		});
	}

	self.loadSalesItems = function() {
		var existing = Array();
		salesList.each(function() {
			if ($(this).data('hash') !== undefined) {
				existing.push(item.data('hash'));
			}
		});
		$.each(saleItems, function(index, item) {
			if ($.inArray(item.hash, existing)) {
				item.insert(salesList);
			}
		});
		if (existing.length === 0 && saleItems.length === 0) {
			salesList.append($('<div>', {
				style : 'text-align: center; width:100%;'
			}).text("No Sales :("));
		}
		self.updateHeader();
		self.setupDelSaleItem();
	}

	self.updateHeader = function() {
		headerView.text(( isUserOnly ? "Your" : "All") + " Sales - $" + String(saleItems.length * 10));
	}

	self.setupDelSaleItem = function() {
		salesList.off("click", ".sales-screen_sale-item_del-button");
		salesList.on("click", ".sales-screen_sale-item_del-button", function() {
			var delHash = $(this).parent().data('hash');
			if ($.inArray(delHash, lock.delSaleArr) === -1) {
				lock.delSaleArr.push(delHash);
				var saleName = $(".sales-screen_sale-item_name", $(this).parent()).text();
				dialog.showConfirm({
					title : "Delete Item",
					text : "Are you sure that you want to delete this sale to " + saleName + "?",
					b1Text : "Yes",
					b2Text : "Cancel",
					b1Callback : function() {
						if (delHash !== undefined) {
							self.deleteSaleItem(delHash);
							drop(lock.delSaleArr, delHash);
						}
					}
				});
			}
		});
	}

	self.deleteSaleItem = function(hash) {
		$.each(saleItems, function() {
			if (this.hash === hash) {
				var thisSale = this;
				$.getJSON(API_DEL_SALES, {
					user : user,
					sale_id : thisSale.id
				}).done(function(data) {
					if (data['success']) {
						thisSale.view.remove();
						saleItems.splice($.inArray(thisSale, saleItems), 1);
						self.loadSalesItems();
					} else {
						alert(data['reason'] + data['errorMessage']);
					}
				}).fail(function() {
					alert('Error deleting item');
				});
			}
		});
	}

	self.hide = function() {
		self.view.hide();
	}
	self.reset = function() {
		salesList.empty();
		saleItems.length = 0;
	}
	// Call setup on this view
	self.setup();
}

function hashGen(len) {
	return Math.random().toString(36).substring(2, len + 2);
}

function hasher() {
	var hash = hashGen(7);
	while (hash.length < 7) {
		hash = hashGen(7);
	}
	return hash;
}

function NewSaleItem() {
	var self = this;

	self.hash = hasher();

	// View variables
	self.view = $('<div>', {
		class : 'new-sales-screen_form-item'
	});
	var inputDiv = $('<div>', {
		class : 'new-sales-screen_form-input'
	});
	var nameInput = $('<input>', {
		type : 'text',
		name : 'name',
		placeholder : 'Name: FirstName LastName',
		class : 'new-sales-screen_form-item-name'
	});
	var phoneInput = $('<input>', {
		type : 'tel',
		name : 'phone',
		placeholder : 'Phone: 9490001111',
		class : 'new-sales-screen_form-item-phone'
	});
	var emailInput = $('<input>', {
		type : 'email',
		name : 'email',
		placeholder : 'Email: yng@ncdm.us',
		class : 'new-sales-screen_form-item-email'
	});
	var buttonContainer = $('<div>', {
		class : 'new-sales-screen_del-button'
	});
	var deleteButton = $('<button>').html("Del");

	// Constants
	var PATTERN_NAME = /[a-zA-Z]+ [a-zA-Z]+.*/;
	var PATTERN_TEL = /[0-9]{10}/;
	var PATTERN_EMAIL = /.*@.*\..*/;

	self.validate = function(flagBlank) {
		var flagBlank = flagBlank === undefined ? false : true;
		var isValid = true;
		nameInput.removeClass('invalid-input');
		if (!PATTERN_NAME.test(nameInput.val())) {
			isValid = false;
			if (flagBlank || (!flagBlank && nameInput.val() !== "")) {
				nameInput.addClass('invalid-input');
			}
		}
		var contactSupplied = true;
		if (flagBlank && emailInput.val() === "") {
			contactSupplied = false;
		}
		phoneInput.removeClass('invalid-input');
		if ((!contactSupplied || phoneInput.val() !== "") && !PATTERN_TEL.test(phoneInput.val())) {
			isValid = false;
			phoneInput.addClass('invalid-input');
		}
		emailInput.removeClass('invalid-input');
		if (emailInput.val() !== "" && !PATTERN_EMAIL.test(emailInput.val())) {
			isValid = false;
			emailInput.addClass('invalid-input');
		}
		return isValid;
	}

	self.get = function() {
		return {
			name : nameInput.val(),
			phone : phoneInput.val(),
			email : emailInput.val()
		};
	}

	self.insert = function(parent) {
		parent.append(self.view);
		self.view.data('hash', self.hash);
	}

	self.setup = function() {
		buttonContainer.append(deleteButton);
		inputDiv.append(nameInput, phoneInput, emailInput);
		self.view.append(inputDiv, buttonContainer);
		inputDiv.on("blur", "input", function() {
			self.validate();
		});
	}

	self.setup();
}

function serializeNewSaleItems(newSaleItems) {
	var partialSerialized = Array();
	$.each(newSaleItems, function(index, item) {
		partialSerialized.push(item.get());
	});
	return JSON.stringify(partialSerialized);
}

function NewSaleScreen() {
	var self = this;

	self.view = $('#new-sales-screen');
	var newSalesContainer = $('#new-sales-screen_new-sale-items');
	var moreButton = $('#new-sales-screen_form-more');
	var submitButton = $('#new-sales-screen_form-submit');
	var backButton = $('#new-sales-screen_back');

	var newSaleItems = Array();

	// Constants
	var API_NEW_SALES = 'http://alexwendland.com/ncdm/fundraising/api/new_sale.php';

	self.setup = function() {
		moreButton.click(function() {
			newSaleItems.push(new NewSaleItem());
			self.loadNewSalesItems();
		});
		submitButton.click(function() {
			var isValid = true;
			$.each(newSaleItems, function(index, item) {
				var thisValid = item.validate(true);
				isValid = isValid ? thisValid : false;
			});
			if (isValid) {
				loadingView.insert(newSalesContainer);
				$.post(API_NEW_SALES, {
					user : user,
					data : serializeNewSaleItems(newSaleItems)
				}).done(function(result) {
					loadingView.remove();
					var data = JSON.parse(result);
					if (data['success']) {
						self.reset();
						salesScreen.show();
					} else {
						alert(data['reason'] + " " + data['errorMessage']);
					}
				}).fail(function() {
					alert("Error adding new item")
				});
			}
		});
		backButton.click(function() {
			self.reset();
			salesScreen.show();
		});
		self.loadNewSalesItems();
	}

	self.loadNewSalesItems = function() {
		var existing = Array();
		newSalesContainer.each(function() {
			if ($(this).data('hash') !== undefined) {
				existing.push(item.data('hash'));
			}
		});
		if (existing.length === 0 && newSaleItems.length === 0) {
			newSaleItems.push(new NewSaleItem());
		}
		$.each(newSaleItems, function(index, item) {
			if ($.inArray(item.hash, existing)) {
				item.insert(newSalesContainer);
			}
		});
		self.setupDelNewSaleItem();
	}

	self.setupDelNewSaleItem = function() {
		newSalesContainer.off("click", ".new-sales-screen_del-button");
		newSalesContainer.on("click", ".new-sales-screen_del-button", function() {
			var delHash = $(this).parent().data('hash');
			if (delHash !== undefined) {
				self.deleteNewSaleItem(delHash);
			}
		});
	}

	self.deleteNewSaleItem = function(hash) {
		$.each(newSaleItems, function() {
			if (this.hash === hash) {
				this.view.remove();
				newSaleItems.splice($.inArray(this, newSaleItems), 1);
			}
		});
		self.loadNewSalesItems();
	}

	self.show = function() {
		hideScreens();
		logout.show();
		self.view.show();
		self.loadNewSalesItems();
	}

	self.hide = function() {
		//self.view.
		self.view.hide();
	}
	self.reset = function() {
		newSalesContainer.empty();
		newSaleItems.length = 0;
	}
	// Call setup on this view
	self.setup();
}