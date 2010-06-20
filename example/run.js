require.paths.push(__dirname + '/../lib');
require.paths.push(__dirname + '/../deps');


var http = require('http'),
    sys = require('sys'),
    fs = require('fs'),
    forms = require('forms'),
    jsontemplate = require('./json-template'),
    parse = require('url').parse;

var fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets;

// template for the example page
var template = jsontemplate.Template(
    fs.readFileSync(__dirname + '/page.jsont').toString()
);


http.createServer(function(req, res){
    // create a new form object
    var form = forms.create({
        name:  fields.string({required: true}),
        email: fields.email({required: true, label: 'Email Address'}),
        website: fields.url(),
        password: fields.password({required: true}),
        password_confirm: fields.password({
            required: true,
            validators: [validators.matchField('password')]
        }),
        options: fields.string({
            choices: {
                one: 'option one',
                two: 'option two',
                three: 'option three'
            },
            widget: widgets.select(),
            validators: [function(form, field, callback){
                if(field.data === 'two') callback('two?! are you crazy?!');
                else callback();
            }]
        }),
        more_options: fields.array({
            choices: {one: 'item 1', two: 'item 2', three: 'item 3'},
            widget: widgets.multipleCheckbox()
        }),
        notes: fields.string({widget: widgets.textarea()}),
        spam_me: fields.boolean()
    });

    form.handle(req, {
        success: function(form){
            var req_data = require('url').parse(req.url,1).query;
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('<h1>Success!</h1>');
            res.write('<pre>' + sys.inspect(form.data) + '</pre>');
            res.end('<pre>' + sys.inspect(req_data) + '</pre>');
        },
        // perhaps also have error and empty events
        other: function(form){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(template.expand({form: form.toHTML()}));
        }
    });

}).listen(8080);

sys.puts('Server running at http://127.0.0.1:8080/');
