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
            self.lazzy = lazzy;

            self.element = document.getElementById(id);
            if (!self.element) {
                self.lazzy.log("Frame [" + id + "] is empty!", CONST.ERROR);
                return null;
            }

            lazzy.frames[id] = self;

            // document.createElement('iframe');

            return self;
        }

        Frame.prototype.setHTML = function (html) {
            var self = this;
            self.element.contentWindow.document.open();
            self.element.contentWindow.document.write(html);
            self.element.contentWindow.document.close();
        };
        Frame.prototype.setSrc = function (src, cb) {
            var self = this;
            self.element.src = src;
            cb();
        };
        Frame.prototype.getContent = function () {
            var self = this;
            var doc = self.element.contentDocument || self.element.contentWindow.document;
            self.lazzy.log(doc.documentElement.innerHTML);
            return doc.documentElement.innerHTML;
        };

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

            self.setTemplate = function (template) {
                self.template = template;
                self.tokens = template.match(tokensReg);
            };

            return self;
        }

        var LAZZY = {
            isReady: false,
            errorlevel: CONST.LVL_ALL,
            templates: {},
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

                //lazzy_struct_json
                self.elementStructureJson = document.getElementById("lazzy_struct_json");
                if (!self.elementStructureJson) {
                    self.log("Cannot load structure json element!", CONST.ERROR);
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

                var structJSON = {
                    "plugins": [
                        //"checkbox",
                        "contextmenu",
                        "dnd",
                        //"massload",
                        //"search",
                        //"sort",
                        "state",
                        //"types",
                        //"unique",
                        //"wholerow",
                        //"changed",
                        //"conditionalselect"
                    ],
                    "state": {"key": "lazzy_structure"},
                    'core': {
                        "multiple": false,
                        "animation": 1,
                        "check_callback": true,
                        'data': [
                            {
                                'id': '1',
                                'text': 'DEFAULT_ROOT',
                            },
                            // {
                            //     'text' : 'Root node 2',
                            //     'state' : {
                            //         'opened' : true,
                            //         'selected' : true
                            //     },
                            //     'children' : [
                            //         {
                            //             'text' : 'Child 1'
                            //         },
                            //         'Child 2'
                            //     ]
                            // }
                        ],
                        '_data': [{"id":"1","text":"DEFAULT_ROOT","icon":true,"li_attr":{"id":"1"},"a_attr":{"href":"#","id":"1_anchor"},"state":{"loaded":true,"opened":true,"selected":false,"disabled":false},"data":{},"children":[{"id":"j1_2","text":"01","icon":true,"li_attr":{"id":"j1_2"},"a_attr":{"href":"#","id":"j1_2_anchor"},"state":{"loaded":true,"opened":true,"selected":true,"disabled":false},"data":{},"children":[{"id":"j1_3","text":"02","icon":true,"li_attr":{"id":"j1_3"},"a_attr":{"href":"#","id":"j1_3_anchor"},"state":{"loaded":true,"opened":false,"selected":false,"disabled":false},"data":{},"children":[]}]}]}]
                    },
                };

                $(self.elementStructure)
                    .on('select_node.jstree', function (e, data) {
                        //changed
                        var i, j, r = [], selected_node;
                        for (i = 0, j = data.selected.length; i < j; i++) {
                            selected_node = data.instance.get_node(data.selected[i]);
                            r.push(selected_node.id + ": " + selected_node.text);
                        }
                        $(self.elementNodeData).html('Selected: ' + r.join(', '));
                    })
                    .on('changed.jstree', function (e, data) {
                        self.log(['changed.jstree', arguments], CONST.INFO);
                        onTreeChange();
                    })
                    .on('create_node.jstree', function (e, data) {
                        self.log(['create_node.jstree', arguments], CONST.INFO);
                        onTreeChange();
                    })
                    .on('delete_node.jstree', function (e, data) {
                        self.log(['delete_node.jstree', arguments], CONST.INFO);
                        onTreeChange();
                    })
                    .on('move_node.jstree', function (e, data) {
                        self.log(['move_node.jstree', arguments], CONST.INFO);
                        //data.instance.refresh();
                        onTreeChange();
                    })
                    .on('rename_node.jstree', function (e, data) {
                        self.log(['rename_node.jstree', arguments], CONST.INFO);
                        onTreeChange();
                    })
                    .on('model.jstree', function (e, data) {
                        self.log(['model.jstree', arguments], CONST.INFO);
                        onTreeChange();
                    })
                    .on('set_text.jstree', function (e, data) {
                        self.log(['set_text.jstree', arguments], CONST.INFO);
                        onTreeChange();
                    })
                    .on('refresh.jstree', function (e, data) {
                        self.log(['refresh.jstree', arguments], CONST.INFO);
                        onTreeChange();
                    })
                    .jstree(structJSON);

                function onTreeChange() {
                    var node_data = {},
                        node = {},
                        nodes = [],
                        options = {
                            //no_data: true,
                            //no_state: true,
                            no_li_attr: true,
                            no_a_attr: true,
                        },
                        json = LAZZY.structure.get_json(null, options);

                    // for (var idx in self.structure._model.data) {
                    //     node_data = self.structure._model.data[idx];
                    //     node = node_data;
                    //     /* {
                    //         "id": data.id,
                    //         "text": data.text,
                    //         "children": data.children,
                    //         "parent": data.parent
                    //     }; */
                    //
                    //     nodes.push(node);
                    // }

                    self.log(['onTreeChange', json], CONST.INFO);

                    self.elementStructureJson.value = JSON.stringify(json);
                }

                self.structure = $.jstree.reference("lazzy_struct");

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
                    self.log(['Templates loaded!'], CONST.INFO);
                    return;
                }

                delete templates[name];

                loaderFrame.setSrc(name, function () {
                    setTimeout(function () {
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

function sss() {

    $(function () {
        $(window).resize(function () {
            var h = Math.max($(window).height() - 0, 420);
            $('#container, #data, #tree, #data .content').height(h).filter('.default').css('lineHeight', h + 'px');
        }).resize();

        $('#tree')
            .jstree({
                'core' : {
                    'data' : {
                        'url' : '?operation=get_node',
                        'data' : function (node) {
                            return { 'id' : node.id };
                        }
                    },
                    'check_callback' : function(o, n, p, i, m) {
                        if(m && m.dnd && m.pos !== 'i') { return false; }
                        if(o === "move_node" || o === "copy_node") {
                            if(this.get_node(n).parent === this.get_node(p).id) { return false; }
                        }
                        return true;
                    },
                    'themes' : {
                        'responsive' : false,
                        'variant' : 'small',
                        'stripes' : true
                    }
                },
                'sort' : function(a, b) {
                    return this.get_type(a) === this.get_type(b) ? (this.get_text(a) > this.get_text(b) ? 1 : -1) : (this.get_type(a) >= this.get_type(b) ? 1 : -1);
                },
                'contextmenu' : {
                    'items' : function(node) {
                        var tmp = $.jstree.defaults.contextmenu.items();
                        delete tmp.create.action;
                        tmp.create.label = "New";
                        tmp.create.submenu = {
                            "create_folder" : {
                                "separator_after"	: true,
                                "label"				: "Folder",
                                "action"			: function (data) {
                                    var inst = $.jstree.reference(data.reference),
                                        obj = inst.get_node(data.reference);
                                    inst.create_node(obj, { type : "default" }, "last", function (new_node) {
                                        setTimeout(function () { inst.edit(new_node); },0);
                                    });
                                }
                            },
                            "create_file" : {
                                "label"				: "File",
                                "action"			: function (data) {
                                    var inst = $.jstree.reference(data.reference),
                                        obj = inst.get_node(data.reference);
                                    inst.create_node(obj, { type : "file" }, "last", function (new_node) {
                                        setTimeout(function () { inst.edit(new_node); },0);
                                    });
                                }
                            }
                        };
                        if(this.get_type(node) === "file") {
                            delete tmp.create;
                        }
                        return tmp;
                    }
                },
                'types' : {
                    'default' : { 'icon' : 'folder' },
                    'file' : { 'valid_children' : [], 'icon' : 'file' }
                },
                'unique' : {
                    'duplicate' : function (name, counter) {
                        return name + ' ' + counter;
                    }
                },
                'plugins' : ['state','dnd','sort','types','contextmenu','unique']
            })
            .on('delete_node.jstree', function (e, data) {
                $.get('?operation=delete_node', { 'id' : data.node.id })
                    .fail(function () {
                        data.instance.refresh();
                    });
            })
            .on('create_node.jstree', function (e, data) {
                $.get('?operation=create_node', { 'type' : data.node.type, 'id' : data.node.parent, 'text' : data.node.text })
                    .done(function (d) {
                        data.instance.set_id(data.node, d.id);
                    })
                    .fail(function () {
                        data.instance.refresh();
                    });
            })
            .on('rename_node.jstree', function (e, data) {
                $.get('?operation=rename_node', { 'id' : data.node.id, 'text' : data.text })
                    .done(function (d) {
                        data.instance.set_id(data.node, d.id);
                    })
                    .fail(function () {
                        data.instance.refresh();
                    });
            })
            .on('move_node.jstree', function (e, data) {
                $.get('?operation=move_node', { 'id' : data.node.id, 'parent' : data.parent })
                    .done(function (d) {
                        //data.instance.load_node(data.parent);
                        data.instance.refresh();
                    })
                    .fail(function () {
                        data.instance.refresh();
                    });
            })
            .on('copy_node.jstree', function (e, data) {
                $.get('?operation=copy_node', { 'id' : data.original.id, 'parent' : data.parent })
                    .done(function (d) {
                        //data.instance.load_node(data.parent);
                        data.instance.refresh();
                    })
                    .fail(function () {
                        data.instance.refresh();
                    });
            })
            .on('changed.jstree', function (e, data) {
                if(data && data.selected && data.selected.length) {
                    $.get('?operation=get_content&id=' + data.selected.join(':'), function (d) {
                        if(d && typeof d.type !== 'undefined') {
                            $('#data .content').hide();
                            switch(d.type) {
                                case 'text':
                                case 'txt':
                                case 'md':
                                case 'htaccess':
                                case 'log':
                                case 'sql':
                                case 'php':
                                case 'js':
                                case 'json':
                                case 'css':
                                case 'html':
                                    $('#data .code').show();
                                    $('#code').val(d.content);
                                    break;
                                case 'png':
                                case 'jpg':
                                case 'jpeg':
                                case 'bmp':
                                case 'gif':
                                    $('#data .image img').one('load', function () { $(this).css({'marginTop':'-' + $(this).height()/2 + 'px','marginLeft':'-' + $(this).width()/2 + 'px'}); }).attr('src',d.content);
                                    $('#data .image').show();
                                    break;
                                default:
                                    $('#data .default').html(d.content).show();
                                    break;
                            }
                        }
                    });
                }
                else {
                    $('#data .content').hide();
                    $('#data .default').html('Select a file from the tree.').show();
                }
            });
    });


}