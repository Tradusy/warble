{

	let

		objectTypes = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error', 'Symbol'],

		typesReference = {},

		error = (value) => new Error(value);

	for (let index = 0, size = objectTypes.length; index < size; index++)

		typesReference[`[object ${objectTypes[index]}]`] = objectTypes[index].toLowerCase();

	class WarbleErrorList {

		constructor() {

			this.errors = [];

		}

		addError(error) {

			if (typeof error === 'string')

				this.errors.push(error);

			else if (typeof error === 'function' && error.name)

				this.errors.push(error.name);

		}

		hasErrors() {

			return this.errors.length > 0;

		}

	}

	class WarbleCore {

		constructor() {

			this.fn = {
				is: {
					// https://www.w3.org/TR/html5/forms.html#e-mail-state-(type=email)
					email: (value) => /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value),
					numeric: (value) => /^\-?\d+(?:\.\d+)?$/.test(value),
					integer: (value) => /^\-?\d+$/.test(value),
					positive: (value) => /^\d+(?:\.\d+)?$/.test(value),
					negative: (value) => /^\-\d+(?:\.\d+)?$/.test(value),
					even: (value) => (Number(value) % 2) === 0,
					odd: (value) => (Number(value) % 2) > 0
				},
				validate: {
					required: (value, isRequired) => isRequired ? value !== undefined : true,
					pattern: (value, pattern) => (core.is(pattern, 'regexp') ? pattern : new RegExp(pattern)).test(value),
					min: (value, min = -Infinity) => (Number(value) || 0) >= (Number(min) || 0),
					max: (value, max = Infinity) => (Number(value) || 0) <= (Number(max) || 0),
					minlength: (value, min = 0) => typeof value === 'string' ? value.length >= (Number(min) || 0) : false,
					maxlength: (value, max = Infinity) => typeof value === 'string' ? value.length <= (Number(max) || 0) : false,
					type: (value, type) => core.type(value) === type,
					is(value, types) {

						var errorList = core.is(value, types, true);

						return errorList.hasErrors() ? errorList : true

					},
					range: (value, range = [-Infinity, Infinity]) => (core.is(range, 'array') && range.length > 1) ? Number(value) >= Number(range[0]) && Number(value) <= Number(range[1]) : false,
					equal(value, to)  {

						return typeof this === 'object' && this.hasOwnProperty(to) ? value === this[to] : false;

					},
					conditional: (value, conditional) => conditional(value),
					options(value, options) {

						if (core.is(options, 'array'))

							for (let index = 0, size = options.length; index < size; index++)

								if (value === options[index])

									return true;

						return false;

					},
					instance: (value, object) => value instanceof object
				}
			};

		}

		type(value) {

			return value === null ? 'null' : (typeof value === 'object' || typeof value === 'function' ? typesReference[typesReference.toString.call(value)] || 'object' : typeof value);

		}

		is(value, types, getErrorList) {

			var

				errorList = this.createErrorList(),

				{ fn, type } = this;

			if (type(types) === 'array') {

				for (let index = 0, size = types.length; index < size; index++) {

					let test = fn.is[types[index]];

					if (typeof test === 'function') {

						if (!test.call(this, value))

							errorList.addError(types[index]);

					} else if (!(type(value) === types[index]))

						errorList.addError(types[index]);

				}

			} else if (typeof fn.is[types] === 'function') {

				if (!fn.is[types].call(this, value))

					errorList.addError(types);

			} else if (!(type(value) === types))

				errorList.addError(types);

			return getErrorList ? errorList : !errorList.hasErrors();

		}

		createErrorList() {

			return new WarbleErrorList;

		}

	}

	let core = new WarbleCore;

	class WarbleFragment {

		constructor(value) {

			this.value = value;

			this.valid = true;

			this.invalid = false;

			this.error = {};

		}

		validate(name, param, parent) {

			var response = typeof core.fn.validate[name] === 'function' ? core.fn.validate[name].call(parent, this.value, param) : true;

			if (!response || response instanceof WarbleErrorList) {

				this.valid = false;

				this.invalid = true;

				this.error[name] = true;

				if (response instanceof WarbleErrorList)

					for (let index = 0, size = response.errors.length; index < size; index++)

						if (response.errors[index] !== name)

							this.error[`${name}:${response.errors[index]}`] = true;

			} else

				delete this.error[name];

			return this;

		}

	}

	class WarbleResponse {

		constructor() {

			this.response = {};

			this.valid = true;

			this.invalid = false;

			this.data = {};

		}

		setResponse(index, value) {

			this.response[index] = value;

		}

		setData(index, value) {

			this.data[index] = value;

		}

		setValid(status) {

			[this.valid, this.invalid] = [status, !status];

		}

	}

	class WarbleModel {

		constructor(model) {

			if (typeof model === 'object')

				this.model = model;

			else

				throw error('WarbleModel expects an object.');

		}

		validate(data) {

			if (typeof data === 'object') {

				let response = new WarbleResponse;

				for (let index in this.model) {

					let value = new WarbleFragment(data[index]);

					if (this.model[index] instanceof WarbleModel) {

						response.setResponse(index, this.model[index].validate(data[index]));

					} else if (typeof this.model[index] === 'object') {

						for (let validation in this.model[index])

							if (value.validate(validation, this.model[index][validation], data).invalid)

								response.setValid(false);

						response.setResponse(index, value);

					}

					response.setData(index, value.value);

				}

				return response;

			} else

				throw error('WarbleModel.validate expects an object.');

		}

	}

	class Warble extends WarbleCore {

		model(model) {

			return new WarbleModel(model);

		}

		validate(value, options) {

			if (typeof options === 'object') {

				var value = new WarbleFragment(value);

				for (let index in options)

					value.validate(index, options[index]);

				return value;

			} else

				throw error('Warble.validate expects an object.');

		}

	}

	var warble = new Warble;

	if (typeof module === 'object' && typeof module.exports === 'object')

		module.exports = warble;

};
