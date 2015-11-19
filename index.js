'use strict';

module.exports = class SimpleResource{
	constructor(expressHandler){
		this.handler = expressHandler;
		this.resources = [];
	}

	resource(params){
		this.resources.push(params);
		if (this.isParentResource(params.name)){
			this.makeRestParent(params);
		}else{

			this.makeRest(params);
		}
		return this;
	}

	makeRest(params) {
		let self = this;
		let _urlSplit =  params.url.split('/:');
		let urlBaseWithoutParams = _urlSplit.slice(0,_urlSplit.length -1).join('/:');
		let urlBase = _urlSplit.join('/:');
		let controller = params.controller;
		if (params.collections)
			self.buildCollectionMap(controller,urlBaseWithoutParams,params.collections);
		if (params.members)
			self.buildMemberMap(controller,urlBase,params.members);
		self.buildRestMap(controller,urlBase,urlBaseWithoutParams);
		
	}


	makeRestParent(params){
		let _params = params
		let nextUrl = '';
		params.name
			.split('.')
				.forEach( (resourceName) => {
					let resource = this.searchResourceWith('name',resourceName);
					if (resource)
						nextUrl += resource.url;

				});
		_params.url = nextUrl+_params.url;
		this.makeRest(_params);
	}


	buildRestMap(controller,urlBase,urlBaseWithoutParams){
		let self = this;
		controller.index  ? self.handler.get(urlBaseWithoutParams,controller.index) : null;
		controller.create ? self.handler.create(urlBaseWithoutParams,controller.create) : null;
		controller.show   ? self.handler.get(urlBase,controller.show) : null;
		controller.delete ? self.handler.delete(urlBase,controller.delete) : null;
		controller.update ? self.handler.put(urlBase,controller.update) : null;

	}


	buildMemberMap(controller,urlBase,members){
		let self = this;
		members 
			.forEach( (member) => {
				if (controller[member.action])
					self.handler[member.method](urlBase+member.url,controller[member.action])
			} );
	}

	buildCollectionMap(controller,urlBaseWithoutParams,collections){
		let self = this;
		collections 
			.forEach( (collection) => {
				if (controller[collection.action])
					self.handler[collection.method](urlBaseWithoutParams+collection.url,controller[collection.action])
				
			} );
	}
	isParentResource(nameResource){
		return nameResource.indexOf('.') != -1;
	}

	searchResourceWith(column,value){
		let _return = false;
		this.resources
			.forEach( (resource) => {
				if (resource[column] == value)
					_return = resource;
			});
		return _return;
	}
}