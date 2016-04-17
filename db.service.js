(function() {
	'use strict';

	angular.module('blocks.db')
		.factory('DB', DB);

	DB.$inject = ['$ionicPlatform', '$cordovaSQLite'];
	function DB($ionicPlatform, $cordovaSQLite) {

		var db;
		var database = "ecc.db";

		var service = {
			query : query,
			get : get,
			get_where : get_where,
			insert : insert,
			insert_batch:insert_batch,
			update : update,
			remove : remove
		};

		$ionicPlatform.ready(function(){
			db = $cordovaSQLite.openDB(database);
		});

		return service;

		///////////////////////////////////
		
		/**
		 * Perform raw query
		 * @param  {string}   query    query to perform
		 * @param  {Function} callback callback function
		 * @return {object}            SQLite object or error message on fail
		 */
		function query(query, callback) {
			$ionicPlatform.ready(function() {

				$cordovaSQLite.execute(db, query)
					.then(function(response) {
						callback(response);
					}, function(error) {
						callback(error);
					});
			});
		}

		/**
		 * Select all records on the given table
		 * @param  {string}   table    table to use
		 * @param  {Function} callback callback function
		 * @return {object}            FALSE on empty or object if not
		 */
		function get(table, callback) {
			$ionicPlatform.ready(function() {

				$cordovaSQLite.execute(db, "SELECT * FROM " + table + ";")
					.then(function(response) {
						callback(results(response));
						// callback(response);
					}, function(error) {
						callback(error);
					});
			});

		}

		/**
		 * Select records with condition
		 * @param  {string}   table     table to use
		 * @param  {string}   condition condition string
		 * @param  {Function} callback  callback function
		 * @return {object}             return FALSE on empty or object if not
		 */
		function get_where(table, condition, callback) {
			$ionicPlatform.ready(function() {

				var q = "SELECT * FROM " + table + " WHERE " + condition + ";";
				// console.log('query:'+q);
				$cordovaSQLite.execute(db, "SELECT * FROM " + table + " WHERE " + condition + ";")
					.then(function(response) {
						callback(results(response));
					}, function(error) {
						callback(error);
					});
			});
		}

		/**
		 * Internal service function for converting result into object or FALSE on empty
		 * @param  {object} response SQLite result object
		 * @return {object}          FALSE on empty or object if not
		 */
		function results(response) {
			var length = response.rows.length;
			var rows = [];
			var row = {};

			// console.log("length:"+length);

			if(length == 0) {
				//we found none
				return false;
			}
			else if(length == 1) {
				//single row is found
				//create an object
				row = response.rows.item(0);
				return row;
			}
			else if(length > 1) {
				//multiple rows are found
				//create an array of object
				for(var i = 0; i < length; i++) {
					rows.push(i)
					rows[i] = response.rows.item(i);
				}
				return rows;
			}
		}

		/**
		 * Insert record on an SQLite table
		 * @param  {string}   table    table to use
		 * @param  {object}   data     object to insert, it should be compatible to table
		 * @param  {Function} callback callback function
		 * @return {object}            returns inserted 'id' on succes or error message on fail
		 */
		function insert(table, data, callback) {
			$ionicPlatform.ready(function() {
				var keys = "";
				var vals = "";
				var count = [];

				//prep data
				for(var i in data) {
					// initiate counter
					count.push(i);
					// set keys
					count.length == 1 ? keys += i : keys += ',' + i;
					// set values
					count.length == 1 ? vals += '\''+data[i]+'\'' : vals += ',' + '\''+data[i]+'\'';
				}

				$cordovaSQLite.execute(db, "INSERT INTO " + table + " (" + keys + ") VALUES (" + vals + ");")
					.then(function(response) {
						//success
						callback(response.insertId);
					}, function(error) {
						//error
						callback(false);
					});
			});
		}

		function insert_batch(table, data, callback) {
			// TODO
			return false;
		}

		/**
		 * Update table with new values
		 * @param  {string}   table    table to use
		 * @param  {object}   data     new values to apply
		 * @param  {Function} callback callback function
		 * @return {object}            returns SQLite object on success or error message on fail
		 */
		function update(table, data, callback) {
			$ionicPlatform.ready(function() {
				var set_vals = "";
				var count = [];

				// prep data
				for(var i in data) {
					// initiate counter
					count.push(i);
					// set values
					count.length == 1 ? set_vals += i + ' = ' + '\'' + data[i] + '\'' : set_vals += ',' + i + ' = ' + '\'' + data[i] + '\'';
				}

				$cordovaSQLite.execute(db, "UPDATE " + table + " SET " + set_vals + " WHERE id = '" + data.id + "';")
					.then(function(response) {
						//success
						callback(response);
					}, function(error) {
						//error
						callback(error);
					});
			});
		}

		/**
		 * Delete record
		 * @param  {string}   table     table to use
		 * @param  {string}   condition delete condition ex.(id=1)
		 * @param  {Function} callback  callback function
		 * @return {object}             SQLite object on success or error message on fail
		 */
		function remove(table, condition, callback) {
			$ionicPlatform.ready(function() {

				$cordovaSQLite.execute(db, "DELETE FROM " + table + " WHERE " + condition + ";")
					.then(function(response) {
						callback(response);
					}, function(error) {
						// error
						callback(error);
					});
			});
		}
	}
})();