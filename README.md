# Simple resource

experimental ES6 Restful router for express 

# Installation

```sh
    npm install simple-resource --save
```

# usage 
```js
'use strict';
 let express = require('express');
 let app = express();
 let SimpleResource = require('simple-resource');
 
 class NoticesController{

	constructor(){
		this.name = "jorge";
	}
	index(req,res){
		console.log(this);
		return res.send('MAP GET /notices')
	}

	show(req,res){
		return res.send('MAP GET /notices/:noticeId')	
	}

	create(req,res){
        return res.send('MAP POST /notices');
	}

	update(req,res){
		return res.send('MAP PUT /notices/:noticeId')
	}

	delete(req,res){
		return res.send('MAP DELETE /notices/:noticeId')
	}


  custom(req,res){
    return res.send('MAP GET /notices/:noticeId/custom')
  }
}

class TagsController{
	index(req,res){
		return res.send(' nested tag from notices resource -> /notices/:noticeId/tags');

	}
}

let customMiddleWare = function(req,res,next){
  console.log('custom middleware optional');
  next();
};



new SimpleResource(app,customMiddleWare)
	.resource({
		name: 'notices',
		url: '/notices/:noticeId',
		controller: new NoticesController,
		members: [
			{
				url: '/custom',
				method: 'get',
				action: 'custom'
			}
		]
	})
	.resource({
		name: 'notices.tags',
		url: '/tags/:tagId',
		controller: new TagsController
	})

app.listen(3000);
```

#  default actions
 * index(get all resources)
 * show(get resource)
 * update(update resource)
 * delete (delete resource)

# tested
```sh
 node -v
  v4.2.2
```

