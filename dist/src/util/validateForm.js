"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const validate_1 = require("../middlewares/validate");
/**
 * post表单验证中间件
 * conf ={
 *  path,
 *  fields : [
 *      {
 *          name,
 *          validate,
 *          allowEmpty, // default is false
 *          msg,
 *      }
 *  ],
 *  onError,
 * }
 */
exports.default = (conf, url) => {
    return class ValidateFrom extends React.Component {
        constructor(props) {
            super(props);
            this.form = null;
            this.submit = this.submit.bind(this);
        }
        iterateFields(onError, onValidate) {
            var form = this.form;
            var fields = Array.from(form.elements);
            for (var field of conf.fields) {
                var elField = fields.find(({ name }) => name == field.name);
                if (!validate_1.validateFunc({
                    body: !elField ? {} : { [field.name]: elField.value },
                    name: field.name, validate: field.validate, allowEmpty: field.allowEmpty
                })) {
                    return onError(field, elField);
                }
                else {
                    onValidate && onValidate(field, elField);
                }
            }
        }
        submit(event) {
            this.iterateFields((field, elField) => {
                conf.onError(field.msg);
                return event.preventDefault();
            });
        }
        getBody() {
            var body = {};
            this.iterateFields((field, elField) => {
                conf.onError(field.msg);
            }, (field, elField) => {
                if (elField) {
                    body[field.name] = elField.value;
                }
            });
            return body;
        }
        render() {
            return React.createElement("form", { method: "post", action: url || conf.path, ref: form => this.form = form, onSubmit: this.submit }, this.props.children);
        }
    };
};
//# sourceMappingURL=validateForm.js.map