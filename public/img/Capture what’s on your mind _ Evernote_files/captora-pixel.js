/*!
 * Shim for MutationObserver interface
 * Author: Graeme Yeates (github.com/megawac)
 * Repository: https://github.com/megawac/MutationObserver.js
 * License: WTFPL V2, 2004 (wtfpl.net).
 * Though credit and staring the repo will make me feel pretty, you can modify and redistribute as you please.
 * Attempts to follow spec (http:// www.w3.org/TR/dom/#mutation-observers) as closely as possible for native javascript
 * See https://github.com/WebKit/webkit/blob/master/Source/WebCore/dom/MutationObserver.cpp for current webkit source c++ implementation
 */
window.MutationObserver=window.MutationObserver||window.WebKitMutationObserver||function(e){"use strict";function t(e){this._watched=[],this._listener=e}function i(e){!function i(){var r=e.takeRecords();r.length&&e._listener(r,e),e._timeout=setTimeout(i,t._period)}()}function r(t){var i={type:null,target:null,addedNodes:[],removedNodes:[],previousSibling:null,nextSibling:null,attributeName:null,attributeNamespace:null,oldValue:null};for(var r in t)p(i,r)&&t[r]!==e&&(i[r]=t[r]);return i}function n(e,t){var i=s(e,t);return function(r){var n,l=r.length;t.attr&&i.attr&&o(r,e,i.attr,t.afilter),(t.kids||t.descendents)&&(n=a(r,e,i,t)),(n||r.length!==l)&&(i=s(e,t))}}function o(e,t,i,n){for(var o,a,s={},l=t.attributes,u=l.length;u--;)o=l[u],a=o.name,(!n||p(n,a))&&(o.value!==i[a]&&e.push(r({type:"attributes",target:t,attributeName:a,oldValue:i[a],attributeNamespace:o.namespaceURI})),s[a]=!0);for(a in i)s[a]||e.push(r({target:t,type:"attributes",attributeName:a,oldValue:i[a]}))}function a(t,i,n,a){function s(e,i,n,s,l){for(var u,d,f,p=e.length-1,g=-~((p-l)/2);f=e.pop();)u=n[f.i],d=s[f.j],a.kids&&g&&Math.abs(f.i-f.j)>=p&&(t.push(r({type:"childList",target:i,addedNodes:[u],removedNodes:[u],nextSibling:u.nextSibling,previousSibling:u.previousSibling})),g--),a.attr&&d.attr&&o(t,u,d.attr,a.afilter),a.charData&&3===u.nodeType&&u.nodeValue!==d.charData&&t.push(r({type:"characterData",target:u})),a.descendents&&c(u,d)}function c(i,n){for(var p,g,h,m,C,v,y,k=i.childNodes,E=n.kids,P=k.length,_=E?E.length:0,b=0,F=0,x=0;P>F||_>x;)v=k[F],C=E[x],y=C&&C.node,v===y?(a.attr&&C.attr&&o(t,v,C.attr,a.afilter),a.charData&&C.charData!==e&&v.nodeValue!==C.charData&&t.push(r({type:"characterData",target:v})),g&&s(g,i,k,E,b),a.descendents&&(v.childNodes.length||C.kids&&C.kids.length)&&c(v,C),F++,x++):(d=!0,p||(p={},g=[]),v&&(p[h=u(v)]||(p[h]=!0,-1===(m=l(E,v,x))?a.kids&&(t.push(r({type:"childList",target:i,addedNodes:[v],nextSibling:v.nextSibling,previousSibling:v.previousSibling})),b++):g.push({i:F,j:m})),F++),y&&y!==k[F]&&(p[h=u(y)]||(p[h]=!0,-1===(m=f(k,y,F))?a.kids&&(t.push(r({type:"childList",target:n.node,removedNodes:[y],nextSibling:E[x+1],previousSibling:E[x-1]})),b--):g.push({i:m,j:x})),x++));g&&s(g,i,k,E,b)}var d;return c(i,n),d}function s(e,t){var i=!0;return function r(e){var n={node:e};return!t.charData||3!==e.nodeType&&8!==e.nodeType?(t.attr&&i&&1===e.nodeType&&(n.attr=d(e.attributes,function(e,i){return(!t.afilter||t.afilter[i.name])&&(e[i.name]=i.value),e},{})),i&&(t.kids||t.charData||t.attr&&t.descendents)&&(n.kids=c(e.childNodes,r)),i=t.descendents):n.charData=e.nodeValue,n}(e)}function l(e,t,i){return f(e,t,i,g("node"))}function u(e){try{return e.id||(e[m]=e[m]||h++)}catch(t){try{return e.nodeValue}catch(i){return h++}}}function c(e,t){for(var i=[],r=0;r<e.length;r++)i[r]=t(e[r],r,e);return i}function d(e,t,i){for(var r=0;r<e.length;r++)i=t(i,e[r],r,e);return i}function f(e,t,i,r){for(;i<e.length;i++)if((r?e[i][r]:e[i])===t)return i;return-1}function p(t,i){return t[i]!==e}function g(e){return e}t._period=30,t.prototype={observe:function(e,t){for(var r={attr:!!(t.attributes||t.attributeFilter||t.attributeOldValue),kids:!!t.childList,descendents:!!t.subtree,charData:!(!t.characterData&&!t.characterDataOldValue)},o=this._watched,a=0;a<o.length;a++)o[a].tar===e&&o.splice(a,1);t.attributeFilter&&(r.afilter=d(t.attributeFilter,function(e,t){return e[t]=!0,e},{})),o.push({tar:e,fn:n(e,r)}),this._timeout||i(this)},takeRecords:function(){for(var e=[],t=this._watched,i=0;i<t.length;i++)t[i].fn(e);return e},disconnect:function(){this._watched=[],clearTimeout(this._timeout),this._timeout=null}};var h=1,m="mo_id";return t}(void 0),function(e,t){"use strict";function i(){if(!o){o=!0;for(var e=0;e<n.length;e++)n[e].fn.call(window,n[e].ctx);n=[]}}function r(){"complete"===document.readyState&&i()}e=e||"docReady",t=t||window;var n=[],o=!1,a=!1;t[e]=function(e,t){return o?void setTimeout(function(){e(t)},1):(n.push({fn:e,ctx:t}),void("complete"===document.readyState||!document.attachEvent&&"interactive"===document.readyState?setTimeout(i,1):a||(document.addEventListener?(document.addEventListener("DOMContentLoaded",i,!1),window.addEventListener("load",i,!1)):(document.attachEvent("onreadystatechange",r),window.attachEvent("onload",i)),a=!0)))}}("docReady",window),function(){"use strict";var e;!function(e){var t;!function(e){var t=function(){function e(){}/*!
             |*|  :: cookies.js ::
             |*|
             |*|  A complete cookies reader/writer framework with full unicode support.
             |*|
             |*|  Revision #1 - September 4, 2014
             |*|
             |*|  https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
             |*|  https://developer.mozilla.org/User:fusionchess
             |*|
             |*|  This framework is released under the GNU Public License, version 3 or later.
             |*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
             |*|
             |*|  Syntaxes:
             |*|
             |*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
             |*|  * docCookies.getItem(name)
             |*|  * docCookies.removeItem(name[, path[, domain]])
             |*|  * docCookies.hasItem(name)
             |*|  * docCookies.keys()
             |*|
             |*|  Modifications:
             |*|
             |*|  * docCookies renamed to DocCookieUtility
             |*|  * Added TypeScript type definitions
             \*/
return e.prototype.getItem=function(e){return e?decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*"+encodeURIComponent(e).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=\\s*([^;]*).*$)|^.*$"),"$1"))||null:null},e.prototype.setItem=function(e,t,i,r,n,o){if(!e||/^(?:expires|max\-age|path|domain|secure)$/i.test(e))return!1;var a="";if(i)switch(i.constructor){case Number:a=i===1/0?"; expires=Fri, 31 Dec 9999 23:59:59 GMT":"; max-age="+i;break;case String:a="; expires="+i;break;case Date:a="; expires="+i.toUTCString()}return document.cookie=encodeURIComponent(e)+"="+encodeURIComponent(t)+a+(n?"; domain="+n:"")+(r?"; path="+r:"")+(o?"; secure":""),!0},e.prototype.hasItem=function(e){return e?new RegExp("(?:^|;\\s*)"+encodeURIComponent(e).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=").test(document.cookie):!1},e.prototype.removeItem=function(e,t,i){return this.hasItem(e)?(document.cookie=encodeURIComponent(e)+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT"+(i?"; domain="+i:"")+(t?"; path="+t:""),!0):!1},e.prototype.keys=function(){for(var e=document.cookie.replace(/((?:^|\s*;)[^=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g,"").split(/\s*(?:\=[^;]*)?;\s*/),t=e.length,i=0;t>i;i++)e[i]=decodeURIComponent(e[i]);return e},e}();e.DocCookieUtility=t}(t=e.doc_cookies||(e.doc_cookies={}))}(e||(e={}));var e,t=this&&this.__extends||function(e,t){function i(){this.constructor=e}for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r]);e.prototype=null===t?Object.create(t):(i.prototype=t.prototype,new i)};!function(e){var i;!function(e){var i=function(e){function i(t){e.call(this),this.cookieDomain=t}return t(i,e),i.prototype.setCookie=function(e,t){return this.setItem(e,t,1/0,"/",this.cookieDomain),this.getItem(e)},i.prototype.removeCookie=function(e){var t=this.getItem(e);return t?(this.removeItem(e,"/",this.cookieDomain),t):""},i}(e.DocCookieUtility);e.CaptoraDocCookieUtility=i}(i=e.doc_cookies||(e.doc_cookies={}))}(e||(e={}));var e;!function(e){var t=function(){function e(){}return e.COOKIE_NAMES={attribUrlCookieName:"colodin_attrib_url",attributableFlagCookieName:"colodin_attributable",oldCookieName:"_EXT_TRACKER_COOKIE_",origReferrerCookieName:"colodin_orig_referrer",thankYouPageReferrer:"colodin_thank_you_page_referrer",thankYouPageUrl:"colodin_thank_you_page_url",uuidCookieName:"colodin_id"},e.HIDDEN_FIELD_NAMES={attribUrl:"cpcampaign",attributable:"cpfirstentry",origReferrer:"cpreferrer"},e.PIXEL_SRC="pixel.captora.com/img/pix.gif",e.PIXEL_CALLS=["capture_card_id","capture_card_cta_id","cta_title","config_id","segment_id"],e}();e.PixelConstants=t}(e||(e={}));var e;!function(e){var t;!function(e){var t=function(){function t(e){this.pagegroups=[],this.thankYouPagePatterns=[],"undefined"!=typeof e&&("undefined"!=typeof e.domain&&this.setDomain(e.domain),"undefined"!=typeof e.fieldFilterConfig&&this.setFieldFilterConfig(e.fieldFilterConfig),"undefined"!=typeof e.formFieldMappings&&this.setFormFieldMappings(e.formFieldMappings),"undefined"!=typeof e.pagegroups&&this.setPagegroups(e.pagegroups),"undefined"!=typeof e.thankYouPagePatterns&&this.setThankYouPagePatterns(e.thankYouPagePatterns),"undefined"!=typeof e.uuid&&this.setUuid(e.uuid))}return t.prototype.setDomain=function(e){return this.domain=e,this},t.prototype.setFieldFilterConfig=function(e){return this.fieldFilterConfig=e,this},t.prototype.setFormFieldMappings=function(e){return this.formFieldMappings=e,this},t.prototype.setPagegroups=function(e){return this.pagegroups=e,this},t.prototype.setThankYouPagePatterns=function(e){return this.thankYouPagePatterns=e,this},t.prototype.setUuid=function(e){return this.uuid=e,this},t.prototype.getDomain=function(){return this.domain},t.prototype.getFieldFilterConfig=function(){return this.fieldFilterConfig},t.prototype.getFormFieldMappings=function(){return this.formFieldMappings},t.prototype.getPagegroups=function(){return this.pagegroups},t.prototype.getThankYouPagePatterns=function(){return this.thankYouPagePatterns},t.prototype.getUuid=function(){return this.uuid},t.prototype.build=function(){return new e.PixelConfig(this)},t}();e.PixelConfigBuilder=t}(t=e.pixel_config||(e.pixel_config={}))}(e||(e={}));var e;!function(e){var t;!function(e){var t=function(){function e(e){this.domain=e.getDomain(),this.fieldFilterConfig=e.getFieldFilterConfig(),this.formFieldMappings=e.getFormFieldMappings(),this.pagegroups=e.getPagegroups(),this.thankYouPagePatterns=e.getThankYouPagePatterns(),this.uuid=e.getUuid()}return e.prototype.getDomain=function(){return this.domain},e.prototype.getFieldFilterConfig=function(){return this.fieldFilterConfig},e.prototype.getFormFieldMappings=function(){return this.formFieldMappings},e.prototype.getPagegroups=function(){return this.pagegroups},e.prototype.getThankYouPagePatterns=function(){return this.thankYouPagePatterns},e.prototype.getUuid=function(){return this.uuid},e}();e.PixelConfig=t}(t=e.pixel_config||(e.pixel_config={}))}(e||(e={}));var e;!function(e){var t;!function(e){var t=function(){function t(){}return t.newElement=function(t,i){return new e.ElementApi(t,i)},t}();e.ElementApiFactory=t}(t=e.element_api||(e.element_api={}))}(e||(e={}));var e;!function(e){var t;!function(e){var t=function(){function t(e,t){this.element=e,this.trackerClient=t}return t.prototype.getAttributes=function(){for(var e={},t=0;t<this.element.attributes.length;t++)e[this.element.attributes[t].name]=this.element.attributes[t].value;return e},t.prototype.isSearchForm=function(){var t=this.element.getElementsByTagName("input"),i=e.ElementApiFactory.newElement(this.element,this.trackerClient).getAttributes();for(var r in i)if(i.hasOwnProperty(r)&&i[r].toLowerCase().indexOf("search")>-1&&t.length<=1)return!0;for(var n=0;n<t.length;n++){var o=e.ElementApiFactory.newElement(t[n],this.trackerClient).getAttributes();for(var a in o)if(o.hasOwnProperty(a)&&o[a].toLowerCase().indexOf("search")>-1&&t.length<=1)return!0}return!1},t.prototype.addEventListenerPolyfill=function(e){if(e)for(var t=e.split(","),i=0;i<t.length;i++){var r=t[i]=t[i].trim();if(this.element.addEventListener){var n=Boolean("blur"===r||"focus"===r);this.element.addEventListener(r,this.trackerClient.eventDelegateHandler,n)}else this.element.attachEvent("on"+r,this.trackerClient.eventDelegateHandler)}},t}();e.ElementApi=t}(t=e.element_api||(e.element_api={}))}(e||(e={}));var e;!function(e){var t=function(){function e(){}return e.updateOrInjectHiddenField=function(t,i,r,n){if(i)i.value=n;else{var o=e.createHiddenInput(r,n);o&&t.appendChild(o)}},e.createHiddenInput=function(e,t){if(!e||!t)return null;var i=document.createElement("input");return i.setAttribute("type","hidden"),i.setAttribute("name",e),i.value=t,i},e.isExcludedForm=function(e,t){return Boolean("undefined"!=typeof e.getFieldFilterConfig()&&"undefined"!=typeof e.getFieldFilterConfig().filterMode&&"getforms"===e.getFieldFilterConfig().filterMode.toLowerCase()&&null!==t.getAttribute("method")&&"get"===t.getAttribute("method").toLowerCase())},e}();e.TrackerFormUtility=t}(e||(e={}));var e;!function(e){var t=e.PixelConstants,i=function(){function e(){}return e.getDocumentURL=function(){return document.URL},e.isCaptoraPageVisit=function(t){for(var i=t.getPagegroups(),r=0;r<i.length;r++)if(e.getDocumentURL().indexOf(i[r].pagegroup)>-1)return!0;return!1},e.handleOldCookie=function(e,i){var r=i.split("__SEP__");e.setCookie(t.COOKIE_NAMES.uuidCookieName,r[0].split("=")[1]);var n=r[1].substr(r[1].indexOf("=")+1,r[1].length-1).split(",");n[0]&&e.setCookie(t.COOKIE_NAMES.origReferrerCookieName,n[0]),"Captora"===n[1]&&e.setCookie(t.COOKIE_NAMES.attributableFlagCookieName,String(!0)),n[2]&&e.setCookie(t.COOKIE_NAMES.attribUrlCookieName,n[2]),e.removeCookie(t.COOKIE_NAMES.oldCookieName)},e.getTrackingElements=function(){return e.HTMLCollectionToArray(document.querySelectorAll("input")).concat(e.HTMLCollectionToArray(document.querySelectorAll("select"))).concat(e.HTMLCollectionToArray(document.querySelectorAll("textarea"))).concat(e.HTMLCollectionToArray(document.querySelectorAll(".cp_element a"))).concat(e.HTMLCollectionToArray(document.querySelectorAll(".cp_element img")))},e.findHiddenFieldNameKey=function(e){var i="__c"===e.substr(-3)?e.substring(0,e.length-3):e;if("cpreferer"===i)return"origReferrer";for(var r in t.HIDDEN_FIELD_NAMES)if(t.HIDDEN_FIELD_NAMES.hasOwnProperty(r)&&i===t.HIDDEN_FIELD_NAMES[r])return r;return null},e.HTMLCollectionToArray=function(e){for(var t=[],i=e.length,r=0;i>r;r++)t.push(e[r]);return t},e.getMergedObject=function(e,t){var i={};for(var r in e)e.hasOwnProperty(r)&&(i[r]=e[r]);for(var n in t)t.hasOwnProperty(n)&&(i[n]=t[n]);return i},e.extractRootDomain=function(e){var t=e.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)[1],i=-2;return t.indexOf(".co.uk")>-1&&(i=-3),t.split(".").slice(i).join(".")},e.getJSONFile=function(e,t){var i;window.XDomainRequest&&"function"==typeof window.XDomainRequest?(i=new window.XDomainRequest,i.onload=function(){var e=JSON.parse(i.responseText);t&&t(e)},i.open("GET",e,!0),i.send()):(i=new XMLHttpRequest,i.onreadystatechange=function(){if(4===i.readyState&&200===i.status){var e=JSON.parse(i.responseText);t&&t(e)}},i.open("GET",e),i.send())},e}();e.TrackerUtility=i}(e||(e={}));var e;!function(e){var t;!function(t){var i=e.element_api.ElementApiFactory,r=function(){function t(t){var i=this;this.eventDelegateHandler=function(t){t=t||window.event;var r=t.target,n=t.currentTarget,o={};if(t&&t.type)switch(r.tagName){case"INPUT":case"SELECT":case"TEXTAREA":if("ALL"===i.pixelConfig.getFieldFilterConfig().filterMode||"password"===r.type)return;if(n.type&&"password"===n.type.toLowerCase())return;if("focus"===t.type||"blur"===t.type||"change"===t.type)if(r.form)for(var a=e.TrackerUtility.HTMLCollectionToArray(r.form.getElementsByTagName("INPUT")).concat(e.TrackerUtility.HTMLCollectionToArray(r.form.getElementsByTagName("SELECT"))).concat(e.TrackerUtility.HTMLCollectionToArray(r.form.getElementsByTagName("TEXTAREA"))),s=0;s<a.length;s++)"password"===a[s].type||"hidden"===a[s].type||"ATTRIBUTES"===i.pixelConfig.getFieldFilterConfig().filterMode&&i.isExcludedField(a[s])||a[s].getAttribute("name")&&(a[s].value||0===a[s].value)&&(o={},o["GOAL_FormField_"+a[s].getAttribute("name")]=a[s].value,i.firePixel(o));else("NONE"===i.pixelConfig.getFieldFilterConfig().filterMode||"ATTRIBUTES"===i.pixelConfig.getFieldFilterConfig().filterMode&&!i.isExcludedField(r))&&(o={},o["GOAL_FormField_"+r.getAttribute("name")]=r.value,i.firePixel(o));break;case"A":case"IMG":var l=r.getAttribute("href"),u="IMG"===r.tagName?r.getAttribute("src"):null;if("click"===t.type&&(u||l)){var c="true"===r.getAttribute("activator");i.firePixel({GOAL_ASSET:u||l},!c)}break;case"FORM":"submit"===t.type&&i.firePixel({GOAL_SUBMIT:!0})}},this.pixelConfig=t,this.progressiveProfile={attribUrl:null,attributable:null,origReferrer:null,prevReferrer:null,prevUrl:null,stateReferrer:null,stateUrl:null},this.defaultPixelParams={domain:this.pixelConfig.getDomain(),url:document.URL,userid:this.pixelConfig.getUuid()},this.docCookies=new e.doc_cookies.CaptoraDocCookieUtility(this.pixelConfig.getDomain()),this.initialize(),this.firePixel({firstPixel:!0}),this.iterateAndFirePixelData(),this.fireThankYouPageCallIfNecessary()}return t.prototype.getPixelConfig=function(){return this.pixelConfig},t.prototype.iterateAndFirePixelData=function(){var t=document.querySelector("head");if(null!==t)for(var i=t.attributes,r=i.length,n=0;r>n;n++){var o=i[n].name.replace("data-",""),a=i[n].value;if(e.PixelConstants.PIXEL_CALLS.indexOf(o)>-1){var s={};s["GOAL_"+o]=a,this.firePixel(s)}}},t.prototype.firePixel=function(t,i){void 0===i&&(i=!1);var r=t?e.TrackerUtility.getMergedObject(this.defaultPixelParams,t):this.defaultPixelParams;r.rand=Math.random();var n="";for(var o in r)r.hasOwnProperty(o)&&(n+=o+"="+encodeURIComponent(r[o])+"&");n+="timestamp="+(new Date).getTime();var a=document.location.protocol+"//"+e.PixelConstants.PIXEL_SRC+"?"+n,s=new Image;if(a.length>8500&&(a=a.substr(0,8500)),s.src=a,i===!0)for(var l=new Date,u=l.getTime()+500;l.getTime()<=u;)l=new Date},t.prototype.mutationObserverCallback=function(t){for(var r=0;r<t.length;r++)if(t[r].addedNodes&&t[r].addedNodes.length)for(var n=0;n<t[r].addedNodes.length;n++){var o=t[r].addedNodes[n];switch(o.tagName){case"FORM":this.handleRuntimeFormInjection(o);break;case"INPUT":case"SELECT":case"TEXTAREA":case"A":case"IMG":i.newElement(o,this).addEventListenerPolyfill("click, focus, blur, change");break;case"DIV":for(var a=e.TrackerUtility.getTrackingElements(),s=0;s<a.length;s++)a[s].form&&(this.addHiddenFieldsToForm(a[s].form,a[s]),this.addSubmitEventListener(a[s].form)),i.newElement(a[s],this).addEventListenerPolyfill("click, focus, blur, change")}}},t.prototype.getUuid=function(){var e=this.pixelConfig.getDomain()||"";return"undefined"!=typeof window.crypto&&"function"==typeof window.crypto.getRandomValues&&"function"==typeof Uint32Array?[].slice.call(window.crypto.getRandomValues(new Uint32Array(3))).join("-")+"-"+e:Math.round(1e11*Math.random())+"-"+Math.round(1e11*Math.random())+"-"+Math.round(1e11*Math.random())+"-"+e},t.prototype.isExcludedField=function(e){for(var t=!1,i=this.pixelConfig.getFieldFilterConfig().filterFields,r=0;r<=i.length-1;r++){var n=i[r];if(e.getAttribute(n.attribute)&&n.value===e.getAttribute(n.attribute)){t=!0;break}}return t},t.prototype.addHiddenFieldsToForm=function(t,i){if(!e.TrackerFormUtility.isExcludedForm(this.getPixelConfig(),t)){if(i){var r=e.TrackerUtility.findHiddenFieldNameKey(i.name),n=t.elements[i.name];if(r&&n.length>1){var o=t.elements[i.name][0];return void(o!==i&&(o.parentNode.removeChild(o),i.value=this.progressiveProfile[r]))}}for(var a in e.PixelConstants.HIDDEN_FIELD_NAMES)e.PixelConstants.HIDDEN_FIELD_NAMES.hasOwnProperty(a)&&this.progressiveProfile.hasOwnProperty(a)&&(e.TrackerFormUtility.updateOrInjectHiddenField(t,t.elements[e.PixelConstants.HIDDEN_FIELD_NAMES[a]],e.PixelConstants.HIDDEN_FIELD_NAMES[a],this.progressiveProfile[a]),e.TrackerFormUtility.updateOrInjectHiddenField(t,t.elements[e.PixelConstants.HIDDEN_FIELD_NAMES[a]+"__c"],e.PixelConstants.HIDDEN_FIELD_NAMES[a]+"__c",this.progressiveProfile[a]),"origReferrer"===a&&(e.TrackerFormUtility.updateOrInjectHiddenField(t,t.elements.cpreferer,"cpreferer",this.progressiveProfile.origReferrer),e.TrackerFormUtility.updateOrInjectHiddenField(t,t.elements.cpreferer__c,"cpreferer__c",this.progressiveProfile.origReferrer)))}},t.prototype.addSubmitEventListener=function(e){i.newElement(e,this).addEventListenerPolyfill("submit")},t.prototype.handleRuntimeFormInjection=function(t){var r=e.TrackerUtility.getTrackingElements();this.addHiddenFieldsToForm(t),this.addSubmitEventListener(t);for(var n=0;n<r.length;n++)i.newElement(r[n],this).addEventListenerPolyfill("click, focus, blur, change")},t.prototype.setStateForThankYouPages=function(){var t=this.docCookies.getItem(e.PixelConstants.COOKIE_NAMES.thankYouPageReferrer);null===t&&(t="");var i=this.docCookies.getItem(e.PixelConstants.COOKIE_NAMES.thankYouPageUrl);null===i&&(i=document.referrer,t=""),this.progressiveProfile.stateReferrer=t,this.progressiveProfile.stateUrl=i,window.parent===window&&(this.docCookies.setCookie(e.PixelConstants.COOKIE_NAMES.thankYouPageReferrer,document.referrer),this.docCookies.setCookie(e.PixelConstants.COOKIE_NAMES.thankYouPageUrl,document.URL))},t.prototype.initialize=function(){var t=this.docCookies.getItem(e.PixelConstants.COOKIE_NAMES.oldCookieName);t&&e.TrackerUtility.handleOldCookie(this.docCookies,t),this.uuid=this.docCookies.getItem(e.PixelConstants.COOKIE_NAMES.uuidCookieName),this.progressiveProfile.origReferrer=this.docCookies.getItem(e.PixelConstants.COOKIE_NAMES.origReferrerCookieName),this.progressiveProfile.attributable=this.docCookies.getItem(e.PixelConstants.COOKIE_NAMES.attributableFlagCookieName)&&!0,this.progressiveProfile.attribUrl=this.docCookies.getItem(e.PixelConstants.COOKIE_NAMES.attribUrlCookieName),this.setStateForThankYouPages(),this.uuid?e.TrackerUtility.isCaptoraPageVisit(this.pixelConfig)&&(this.progressiveProfile.attribUrl=document.URL,this.docCookies.setCookie(e.PixelConstants.COOKIE_NAMES.attribUrlCookieName,document.URL)):(this.uuid=this.getUuid(),this.docCookies.setCookie(e.PixelConstants.COOKIE_NAMES.uuidCookieName,this.uuid),document.referrer&&(this.progressiveProfile.origReferrer=document.referrer,this.docCookies.setCookie(e.PixelConstants.COOKIE_NAMES.origReferrerCookieName,document.referrer)),e.TrackerUtility.isCaptoraPageVisit(this.pixelConfig)&&(this.progressiveProfile.attributable=!0,this.progressiveProfile.attribUrl=document.URL,this.docCookies.setCookie(e.PixelConstants.COOKIE_NAMES.attributableFlagCookieName,String(!0)),this.docCookies.setCookie(e.PixelConstants.COOKIE_NAMES.attribUrlCookieName,document.URL))),this.defaultPixelParams.userid=this.uuid,""!==document.referrer&&(this.defaultPixelParams.referrer=document.referrer)},t.prototype.fireThankYouPageCallIfNecessary=function(){var e=this.pixelConfig.getThankYouPagePatterns();if(e&&e.length)for(var t=0;t<e.length;t++)if(document.URL.indexOf(e[t])>-1&&""!==e[t].trim()){this.defaultPixelParams.url=this.progressiveProfile.stateUrl,this.defaultPixelParams.referrer=this.progressiveProfile.stateReferrer,this.firePixel({GOAL_TRACKURL:this.progressiveProfile.attribUrl});break}},t}();t.TrackerClient=r}(t=e.tracker_client||(e.tracker_client={}))}(e||(e={}));/*!
 * @copyright Captora, Inc. 2015.
 * Any modifications to this code will not be supported by Captora and its APIs.
 */
var i;!function(t){var i=e.tracker_client.TrackerClient,r=e.TrackerUtility,n=e.element_api.ElementApiFactory,o=e.pixel_config.PixelConfigBuilder,a=null,s=[],l=[],u=null;if("undefined"==typeof window.fireColodinPixel){window.docReady(function(){var e=document.getElementsByTagName("BODY")[0];u=new MutationObserver(function(e){l.push(e)}),u.observe(e,{childList:!0,subtree:!0})}),window.fireColodinPixel=function(e){s.push(e)};var c="function"==typeof window.cpTrackingClientConfig?window.cpTrackingClientConfig:null;window.cpTrackingClientConfig=function(e){for(a=new i(new o(e).build());s.length;)a.firePixel.call(a,s.shift());window.fireColodinPixel=function(e){a.firePixel.call(a,e)};var t=function(){for(var e=document.getElementsByTagName("BODY")[0],t=r.getTrackingElements(),i=0;i<t.length;i++)n.newElement(t[i],a).addEventListenerPolyfill("click, focus, blur, change");for(var o=document.getElementsByTagName("FORM"),s=0;s<o.length;s++)n.newElement(o[s],a).isSearchForm()||a.addHiddenFieldsToForm(o[s]);l.forEach(function(e){a.mutationObserverCallback.call(a,e),u.disconnect()});var c=new MutationObserver(function(e){a.mutationObserverCallback.call(a,e)});c.observe(e,{childList:!0,subtree:!0})};window.docReady(t),c&&c(e)},r.getJSONFile("//cdn.captora.com/js/evernote.com/pixel-config.json",window.cpTrackingClientConfig)}}(i||(i={}))}();
