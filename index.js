'use strict';

class SimpleResource{
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
			self.buildCollectionsMap(controller,urlBaseWithoutParams,params.collections);
		if (params.members)
			self.buildMembersMap(controller,urlBase,params.members);
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
		let collections = [
			{
				url: urlBaseWithoutParams,
				method: 'get',
				action: 'index'
			},
			{
				url: urlBaseWithoutParams,
				method: 'post',
				action: 'create'
			},
			{
				url: urlBase,
				method: 'get',
				action: 'show'
			},
			{
				url: urlBase,
				method: 'put',
				action: 'update'
			},
			{
				url: urlBase,
				method: 'delete',
				action: 'delete'
			}
		];

		self.buildCollectionsMap(controller,'',collections);
	}

	buildMap(paramsMap){
		let self = this;
		let handler = self.handler[paramsMap.method];
		let url = paramsMap.url;
		let controller =  paramsMap.controller;
		let action = controller[paramsMap.action].bind(controller);
		handler
			.apply(self.handler,[
				url,
				action
			]);	
	}

	buildMembersMap(controller,urlBase,members){
		let self = this;
		members 
			.forEach( (member) => {
				if (controller[member.action]){
					let paramsMap = {
						method: member.method,
						controller: controller,
						url: urlBase+member.url,
						action: member.action
					}
					self.buildMap(paramsMap);
				}
			} );
	}

	buildCollectionsMap(controller,urlBaseWithoutParams,collections){
		let self = this;
		collections 
			.forEach( (collection) => {
				if (controller[collection.action]){
					let paramsMap = {
						method: collection.method,
						controller: controller,
						url: urlBaseWithoutParams+collection.url,
						action: collection.action
					}
					self.buildMap(paramsMap);
				}
				
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

module.exports = SimpleResource;