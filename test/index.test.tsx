require('should')
import * as should from 'should'
import * as Koa from 'koa'
import * as request from 'supertest-as-promised'
import * as React from 'react'
import { chdir, resetdir, initBrowser, initDb } from './util';
import { FooApi1, FooApi2 } from "../app_test/api";
import axios from 'axios'

var App = require('../dist').RunApp
process.on('unhandledRejection', error => {
  console.log('unhandledRejection', require('util').inspect(error));
});
describe('#koa-cola', function() {
    var server;
	var mongoose;
	before(function() {
		console.log(process.cwd())
		chdir();
		server = App({
			config : {
				override_config : 'override'
			}
		});
		return initDb();
	});
	after(function(done){
		server.close();
		global.app.mongoose.disconnect(done)
		delete global.app;
		resetdir();
	})
	describe('#koa', function() {
		it('#hello world', async function(){
			var res = await request(server)
                .get("/")
                .expect(200)
                .toPromise();
			res.text.should.be.equal('hello world')		
		});
	});

	describe('#controller-decorators', function() {
		it('#injectCtxAndResponse201', async function(){
			var res = await request(server)
                .get("/injectCtx")
                .expect(201)
                .toPromise();
			res.text.should.be.equal('injectCtx')		
		});
		it('#upload files', async function(){
			var res = await request(server)
				.post('/uploadFiles')
				.attach('avatar', '../test/fixtures/cola.png')
                .expect(200)
                .toPromise();
			res.body.files.avatar.name.should.equal('cola.png')
		});

		it('#postBody', async function(){
			var body = { name: 'Manny', species: 'cat' };
			var res = await request(server)
                .post("/postBody")
				.field('name', 'Manny')
				.field('species', 'cat')
                .expect(200)
                .toPromise();
			res.body.fields.name.should.be.equal(body.name);
			res.body.fields.species.should.be.equal(body.species);
		});
		it('#get postBody error', async function(){
			var res = await request(server)
                .get("/postBody")
                .expect(405)
		});
		it('#getQuery', async function(){
			var body = { name: 'Manny', species: 'cat' };
			var res = await request(server)
                .get('/getQuery?' + Object.keys(body).map(item => `${item}=${body[item]}`).join('&'))
                .expect(200)
                .toPromise();
			res.text.should.be.equal(JSON.stringify(body));
		});
	});

	describe('#controller-view', function() {
		it('#normal view', async function(){
			var foo = require(`${process.cwd()}/views/pages/simple`).foo;
			var res = await request(server)
                .get('/simple')
                .expect(200)
                .toPromise();
			should(res.text).containEql(foo);
		});
		it('#view with async redux', async function(){
			// pepsi is sync, coca is async
			var { pepsi, coca, timeout } = require(`${process.cwd()}/views/pages/cola`);
			var startTimeout : any = new Date();
			var res = await request(server)
                .get('/cola')
                .expect(200)
                .toPromise();
			var endTimeout : any = new Date();
			should(endTimeout - startTimeout).greaterThan(timeout)
			should(res.text).containEql(pepsi);
			should(res.text).containEql(coca);
		});

		// it('#view with inject props from controller', async function(){
		// 	var res = await request(server)
        //         .get('/autoLoadFromPages1?foo=bar')
        //         .expect(200)
        //         .toPromise();
		// 	should(res.text).containEql('bar');
		// 	should(res.text).containEql('"ctrl":{"foo":"bar"}');
		// });


		it('#header and bundle decorator', async function(){
			var res = await request(server)
                .get('/headerAndBundle')
                .expect(200)
                .toPromise();
			should(res.text).containEql('<meta name="viewport" content="width=device-width"');
			should(res.text).containEql('<script src=\'/test.js\'></script>');
		});
		it('#pageProps', async function(){
			var res = await request(server)
                .get('/pageProps?title=pageProps')
                .expect(200)
                .toPromise();
			should(res.text).containEql('<title>pageProps</title>');
		});

		/*it('#view with server call api', async function(){
			var res = await request(server)
                .get('/cola')
				.set('Cookie', ['server_call_cookie-token=1'])
                .expect(200)
                .toPromise();
			should(res.text).containEql('server_call_cookie')
		});*/
	});

	// describe('#router&provider', function() {
	// 	it('#router', async function(){
	// 		var router = app.routers.router;
	// 		router.should.be.ok;
	// 		// router.props.children.length.should.be.equal(5);
	// 		router.props.children[0].type.displayName.should.be.equal('Route');
	// 		// router.props.children[0].type.should.be.equal(Route);
	// 		router.props.children[0].props.path.should.be.ok;
	// 		router.props.children[0].props.component.should.be.ok;
	// 	});

	// 	it('#provider', async function(){
	// 		// TODO
	// 	});
	// });

	describe('#models', function() {
		
		it('#base', async function(){
			var User = global.app.mongoose.model('User')
			var result = await User.create({name : 'harry', email : 'hcnode@gmail.com'});
			result._id.should.be.ok;
		});

		it('#Manual validate', async function(){
			var User = global.app.mongoose.model('User')
			var exceptionHappened = false;
			try{
				var result = await User.create({name : 'harry'});
			}catch(e){
				e.message.should.equal('400');
				exceptionHappened = true;
			}
			exceptionHappened.should.be.ok;
		});
		it('#query', async function(){
			var User = global.app.mongoose.model('User')
			var [result] = await User.find({name : 'harry'}).exec();
			result.name.should.be.equal('harry');
		});
		// when use mockgoose something wrong with aggregate
		// it('#aggregate', async function(){
		// 	var User = global.app.models.user
		// 	await User.create({name : 'harry', email : 'xxx@gmail.com'});
		// 	var [result] = await User.aggregate([
		// 		{
		// 			$project: { name: 1, email: 1 }
		// 		},
		// 		{
		// 			$group : {
		// 				_id : '$name',
		// 				count: { $sum: 1 }
		// 			}
		// 		}
		// 	]);
		// 	result.count.should.be.ok;
		// });
	});


	describe('#response', function() {
		it('#ok', async function(){
			var res = await request(server)
                .get('/getOkResponse')
                .expect(200)
                .toPromise();
			var json = JSON.parse(res.text);
			json.code.should.be.equal(200);
			json.result.should.be.ok;
		});
	});

	describe('#response error', function() {
		it('#404 render from tsx', async function(){
			var res = await request(server)
                .get('/404')
				.set('Accept', 'text/html')
                .expect(404)
                .toPromise();
			should(res.text).match(/rendered from 404.tsx/);
		});
		it('#500', async function(){
			var res = await request(server)
                .get('/500')
				.set('Accept', 'text/html')
                .expect(500)
                .toPromise();
			should(res.text).match(/Internal Server Error/);
		});

		it('#response 500 json', async function(){
			var res = await request(server)
                .get('/500')
				.set('Accept', 'application/json')
                .expect(500)
				.toPromise();
			res.body.error.should.be.equal('Internal Server Error');
			res.body.stack.should.be.ok;
			// should(res.text).match(/Internal Server Error/);
		});
	});

	describe('#policies', function() {
		it('#not login and throw 401', async function(){
			var res = await request(server)
                .get('/notLogin')
                .expect(401)
                .toPromise();
			res.text.should.be.equal('Unauthorized');
		})

		it('#login', async function(){
			var res = await request(server)
                .get('/isLogin')
                .expect(200)
                .toPromise();
			res.text.should.be.equal('logined.');
		})
	});

	describe('#env and config', function() {
		it('#test config extend default', async function(){
			global.app.config.env.should.be.equal('test');
		});
		it('#test config override default', async function(){
			should(global.app.config.middlewares.disabledMiddleware).not.be.ok;
			var res = await request(server)
                .get('/testConfigOverride')
                .expect(200)
                .toPromise();
			res.text.should.be.equal('diabled');
		});

		it('#override by launch config', async function(){
			global.app.config.override_config.should.be.equal('override');
		});
		// it('#test bootstrap config', async function(){
		// 	app.koaApp.proxy.should.be.equal(true);
		// });
	});
	describe('#services and managers', function() {
		it('#say hi', async function(){
			new app.managers.TestManager().hi().should.be.equal('hi');
		});
	});
	describe('#test session', function() {
		it('#session.count', async function(){
			const agent = request.agent(server);
			var res = await agent
                .get('/session')
                .expect(200)
                .toPromise();
			var count1 = parseInt(res.text, 10);
			count1.should.be.equal(1)
			res = await agent
                .get('/session')
                .expect(200)
                .toPromise();
			var count2 = parseInt(res.text, 10);
			count2.should.be.equal(2)
		});
	});
	describe('#test custom http code', () => {
		it('#without view', async () => {
			var res = await request(server)
				.get('/customHttpCode')
				.set('Accept', 'text/html')
				.expect(450)
				.toPromise();
			should(res.text).containEql('this is custom http status code');
		});

		it('#with view', async () => {
			var res = await request(server)
				.get('/renderCustomHttpCode')
				.set('Accept', 'text/html')
				.expect(452)
				.toPromise();
			should(res.text).containEql('rendered 452 error');
		});


		it('#neither standard code nor custom code', async () => {
			var res = await request(server)
				.get('/neitherStandardCodeNorCustomCode')
				.set('Accept', 'text/html')
				.expect(500)
				.toPromise();
			should(res.text).containEql('unknow error');
			should(res.text).containEql('invalid status code: 453');
		});
	});

	describe('#test api', () => {
		it('#get', async () => {
			var fooApi1 = new FooApi1({foo : 'cola1'});
			var data = await fooApi1.fetch({});
			data.result.koa.should.be.equal('cola1');
		});
		it('#post', async () => {
			var fooApi2 = new FooApi2({foo : 'cola2'});
			var data = await fooApi2.fetch({});
			data.result.koa.should.be.equal('cola2');
		});
	});
	
	describe('#test validation', () => {
		it('#validatePost', async () => {
			var res = await request(server)
                .post("/validatePost")
				.field('account', '')
                .expect(400)
                .toPromise();
		});
	});
});
