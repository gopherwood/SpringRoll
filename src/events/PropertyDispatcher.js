/**
*  @module Core
*  @namespace springroll
*/
(function(undefined)
{
	var EventDispatcher = include('springroll.EventDispatcher');

	/**
	* Event dispatcher with ability to detect whenever a property
	* is changed.
	* @class PropertyDispatcher
	* @extends springroll.EventDispatcher
	* @constructor {Object} [overrides] The supplied options
	*/
	var PropertyDispatcher = function()
	{
		EventDispatcher.call(this);

		/**
		 * The map of property values to store
		 * @private
		 * @property {Object} _properties
		 */
		this._properties = {};
	};

	// Extend the base class
	var s = EventDispatcher.prototype;
	var p = extend(PropertyDispatcher, EventDispatcher);

	/**
	 * Generic setter for an option
	 * @private
	 * @method set
	 * @param {string} prop The property name
	 * @param {mixed} value The value to set
	 */
	var set = function(name, value)
	{
		var prop = this._properties[name];
		var oldValue = prop.value;
		prop.value = value;
		if (oldValue != value)
		{
			this.trigger(name, value);
		}
	};

	/**
	 * Generic setter for an option
	 * @private
	 * @method get
	 * @param {string} prop The option name
	 * @return {mixed} The value of the option
	 */
	var get = function(name)
	{
		var prop = this._properties[name];
		if (prop.responder)
		{
			var value = prop.responder();
			prop.value = value;
			return value;
		}
		return prop.value || null;
	};

	/**
	 * Add a new property to allow deteching
	 * @method addProp
	 * @param {string} prop The property name
	 * @param {mixed} [initValue] The default value
	 * @param {Boolean} [readOnly=false] If the property is readonly
	 * @return {PropertyDispatcher} The instance for chaining
	 */
	p.addProp = function(name, initValue, readOnly)
	{
		if (this._properties[name] !== undefined)
		{
			if (RELEASE)
				throw "Property " + name + " already exists";
			else
				throw "Property " + name + " already exists and cannot be added multiple times";
		}
		
		if (this.hasOwnProperty(name))
		{
			throw "Object already has property " + name;
		}

		this._properties[name] = new Property(name, initValue, readOnly);

		Object.defineProperty(this, name, {
			get: get.bind(this, name),
			set: set.bind(this, name)
		});
		return this;
	};

	/**
	 * Turn on read-only for properties
	 * @method readOnly
	 * @param {String} prop* The property or properties to make readonly
	 * @return {PropertyDispatcher} The instance for chaining
	 */
	p.readOnly = function(properties)
	{
		var prop, name;
		for(var i in arguments)
		{
			name = arguments[i];
			prop = this._properties[name];
			if (prop === undefined)
			{
				throw "Property " + name + " does not exist";
			}
			prop.readOnly = true;
		}
	};

	/**
	 * Whenever a property is get a responder is called
	 * @method respond
	 * @param {String} name The property name
	 * @param {Function} responder Function to call when getting property
	 * @return {PropertyDispatcher} The instance for chaining
	 */
	p.respond = function(name, responder)
	{
		var prop = this._properties[name];
		if (prop === undefined)
		{
			if (RELEASE)
				throw "Property " + name + " does not exist";
			else
				throw "Property " + name + " does not exist, you must addProp() first before adding responder";
		}
		prop.responder = responder;

		// Update the property value
		prop.value = responder();
		
		return this;
	};

	/**
	 * Internal class for managing the property
	 */
	var Property = function(name, value, readOnly)
	{
		this.name = name;
		this.value = value === undefined ? null : value;
		this.readOnly = readOnly === undefined ? false : !!readOnly;
		this.responder = null;
	};

	/**
	 * Clean-up all references, don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		var prop;
		for (var name in this._properties)
		{
			prop = this._properties[name];
			prop.value = null;
			prop.responder = null;
		}
		this._properties = null;
		s.destroy.call(this);
	};

	// Assign to namespace
	namespace('springroll').PropertyDispatcher = PropertyDispatcher;

}());