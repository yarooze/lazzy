(
    function () {
        'use strict';

        var CONST = {
                INFO: 2,
                ERROR: 1,
                LVL_ALL: 2,
                LVL_ERROR: 1,
                LVL_SILENT: 0
        };

        function Frame(id, lazzy) {
            var self = this;

            if (!lazzy) {
                console.error("LAZZY is empty!");
                return null;
            }

            self.element = document.getElementById(id);
            if (!self.element) {
                lazzy.log("Frame [" + id + "] is empty!", CONST.ERROR);
                return null;
            }

            lazzy.frames[id] = self;

            self.setHTML = function (html) {
                self.element.contentWindow.document.open();
                self.element.contentWindow.document.write(html);
                self.element.contentWindow.document.close();
            }

            self.setSrc = function (src, cb) {
                self.element.src = src;
                cb();
            }

            self.getContent = function() {
                var doc = self.element.contentDocument || self.element.contentWindow.document;
                lazzy.log(doc.documentElement.innerHTML);
                return doc.documentElement.innerHTML; //self.element.contentWindow.document.documentElement.innerHTML;
            };

            // document.createElement('iframe');

            return self;
        }


        function Template(id, options, lazzy) {
            var self = this,
                tokensReg = /####[^#]*####/g;

            if (!lazzy) {
                console.error("LAZZY is empty!");
                return null;
            }

            lazzy.templates[id] = self;

            self.defaults = {};

            if (!options) {
                options = {};
            }

            if (options.defaults) {
                self.defaults = options.defaults;
            }

            self.setTemplate = function(template) {
                self.template = template;
                self.tokens = template.match(tokensReg);
            };

            return self;
        }

        var  LAZZY = {
                isReady: false,
                errorlevel: CONST.LVL_ALL,
                templates : {},
                frames: {},
                    
                elementStructure: null,
                elementNodeData: null,
                    
                log: function (msg, lvl) {
                        var self = LAZZY;
                        if (!lvl) {
                                lvl = CONST.INFO;
                        }
                        if (lvl > self.errorlevel) {
                                return;
                        }
                        console.log(msg);
                },

                init: function () {
                    var self = LAZZY;

                    if (!new Frame("preview", self)) {
                        self.log("Cannot load preview frame!", CONST.ERROR);
                        return;
                    }

                    if (!new Frame("loader", self)) {
                        self.log("Cannot load loader frame!", CONST.ERROR);
                        return;
                    }
                    
                    
                    self.elementStructure = document.getElementById("lazzy_struct");
                    if (!self.elementStructure) {
                        self.log("Cannot load structure element!", CONST.ERROR);
                        return;
                    }                    
                    self.initStruct();
                    
                    self.elementNodeData = document.getElementById("node_data");
                    if (!self.elementNodeData) {
                        self.log("Cannot load node data element!", CONST.ERROR);
                        return;
                    }

                    self.isReady = true;
                },
                
                start: function () {
                        var self = LAZZY;
                        if (!self.isReady) {
                                return false;
                        }


                        self.log('LAZZY started!', CONST.INFO);
                        return true;
                },
                
                initStruct: function () {
                    var self = LAZZY;

                    $(self.elementStructure)
                        .on('select_node.jstree', function (e, data) {
                            //changed
                            var i, j, r = [], selected_node;
                            for(i = 0, j = data.selected.length; i < j; i++) {
                                selected_node = data.instance.get_node(data.selected[i]);
                              r.push(selected_node.id + ": " + selected_node.text);
                            }
                            $(self.elementNodeData).html('Selected: ' + r.join(', '));
                        })
                        .jstree({
                        "plugins" : [
                            //"checkbox",
                            "contextmenu",
                            "dnd",
                            //"massload",
                            //"search",
                            //"sort",
                            //"state",
                            //"types",
                            //"unique",
                            //"wholerow",
                            //"changed",
                            //"conditionalselect"
                        ],
                        'core' : {
                            "multiple" : false,
                            "animation" : 1,
                            "check_callback" : true,
                            'data' : [
                                {
                                    'id': '12345',
                                    'text': 'Simple root node',
                                },
                                {
                                 'text' : 'Root node 2',
                                 'state' : {
                                   'opened' : true,
                                   'selected' : true
                                 },
                                 'children' : [
                                   { 
                                       'text' : 'Child 1' 
                                   },
                                   'Child 2'
                                 ]
                                }
                            ]
                        },
                    });
                },
                
                loadTemplates: function (templates) {
                        var self = LAZZY,
                            loaderFrame = self.frames.loader,
                            content,
                            options,
                            template_names = Object.keys(templates),
                            name = template_names.pop(),
                            options = templates[name]
                        ;

                    if (!name) {
                        // self.isReady = true;
                        return;
                    }

                    delete templates[name];

                    loaderFrame.setSrc(name, function() {
                        setTimeout(function() {
                            content = loaderFrame.getContent();
                            self.log(['Get content for template', name, content], CONST.INFO);

                            if (!new Template(name, options, self)) {
                                return;
                            }

                            self.templates[name].setTemplate(content);
                            self.log("Loaded template: " + name);

                            self.loadTemplates(templates);
                        }, 500);
                    });

                }

        };

        LAZZY.init();

        window.LAZZY = LAZZY;
    }
)();