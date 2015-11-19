'use strict';

class SimpleResource{
	constructor(expressHandler,defaultMiddleware){
		this.handler = expressHandler;
		this.resources = [];
		if (defaultMiddleware == null)
			this.middleware = this.defaultMiddleware;
		else
			this.middleware = defaultMiddleware;

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
			self.buildCollectionsMap({
				controller: controller,
				urlBaseWithoutParams: urlBaseWithoutParams,
				collections: collections
			});
		if (params.members)
			self.buildMembersMap({
				controller: controller,
				urlBase: urlBase,
				members: params.members
			});

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

		self.buildCollectionsMap({
			controller: controller,
			urlBaseWithoutParams: '',
			collections: collections
		});
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
				paramsMap.middleware.bind(controller),
				action
			]);	
	}

	buildMembersMap(paramsMember){
		let self = this;
		let members = paramsMember.members;
		let controller = paramsMember.controller;
		let urlBase = paramsMember.urlBase;
		members 
			.forEach( (member) => {
				if (paramsMember.controller[member.action])
					self.buildMap({
						method: member.method,
						controller: controller,
						url: urlBase+member.url,
						action: member.action,
						middleware: member.middleware ? member.middleware : self.middleware
					});
				
			} );
	}

	buildCollectionsMap(paramsCollection){
		let self = this;
		paramsCollection.collections 
			.forEach( (collection) => {
				if (paramsCollection.controller[collection.action]){
					self.buildMap({
						method: collection.method,
						controller: paramsCollection.controller,
						url: paramsCollection.urlBaseWithoutParams+collection.url,
						action: collection.action,
						middleware: collection.middleware ? member.middleware : self.middleware

					});
				}
				
			} );
	}

	defaultMiddleware(req,res,next) {
		return next();
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