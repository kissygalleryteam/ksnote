/*
combined files : 

gallery/ksnote/1.0/index

*/
/**
 * @fileoverview 
 * @author 肖涛<wb-xiaotao@taobao.com>
 * @module ksnote
 **/
KISSY.add('gallery/ksnote/1.0/index',function (S, Node, Base, DD, Proxy, Storage) {
    var $ = Node.all,
        D = S.DOM,
        Drag = DD.Draggable;

    //初始化本地存储构造函数
    var storage = new Storage();

    var NOTEHTML = '<div class="{prefixCls}note ks-note">' 
        + '<div class="{prefixCls}note-hd">'
            + '<i class="{prefixCls}note-nail"></i>'
            + '<h4>{title}</h4>'
        + '</div>' 
        + '<div class="{prefixCls}note-bd">'
            + '<textarea class="{prefixCls}note-text" id="ksnote{id}">{text}</textarea>'
            + '<a href="javascript:void(0);" class="{prefixCls}note-hide" title="隐藏"></a>'
            + '<a href="javascript:void(0);" class="{prefixCls}note-delete" title="删除"></a>'
            + '{hasLink}'
        + '</div>'
    + '</div>';

    /**
     * //调用父类构造函数,配置函数见ATTRS
     * @param {String/HTMLElement} trigger 触发器,可忽略
     * @param {Object} config  配置,可忽略
     */
    function Ksnote(trigger, config) {
        if (trigger && D.get(trigger).nodeType == undefined) {
            config = trigger;
            trigger = undefined;
        }
        
        Ksnote.superclass.constructor.call(this, config);
        this._init.call(this, trigger);
    }

    S.extend(Ksnote, Base);

    Ksnote.ATTRS = {
        /**
         * 浮层样式前缀
         * @type {String}
         */
        prefixCls: {
            value: 'ks-'
        },
        /**
         * 标题名称
         * @type {String}
         */
        title: {
            value: ''
        },
        /**
         * 是否跨域访问(不含子域)
         * @type {Boolean}
         */
        isCrossDomain: {
            value: false
        },
        /**
         * 需要在isCrossDomain = true
         * @type {String}
         */
        domain: {},
        /**
         * 是否显示已有笔记
         * @type {Object}
         */
        isShowOld: {
            value: true
        }
    };

    S.augment(Ksnote, {
        /**
         * 构造函数初始化
         * @ignore
         */
        _init: function(trigger) {
            var self = this;
            if (trigger) {
                this.trigger = $(trigger);
            } else {
                this.trigger = $(document);
            }
            self.getData(function(data) {
                self._renderUI(data);
                self._bindEvent();
            })
        },
        /**
         * 渲染UI层
         * @param  {Object} data 本地笔记数据,可为空
         * @return {void}        无返回值
         */
        _renderUI: function(data) {
            var self = this,
                prefixCls = this.get('prefixCls'),
                renderData;

            if (!data) {
                renderData = {
                    prefixCls: self.get('prefixCls'),
                    title: self.get('title'),
                };
            } else {
                //渲染相关链接
                renderData = S.merge(data, {
                    hasLink: data.link ? '<a href="' + data.link + '" class="'+ prefixCls +'note-link" target="_blank">go to look?</a>' : ''
                });
            }
            var noteNode = S.substitute(NOTEHTML, renderData);
            $(noteNode).appendTo('body');

            //使用拖拽插件
            new Drag({
                move: true,
                node: '.ks-note',
                handlers: ['.ks-note-hd']
            }).plug(Proxy).on('dragend', function(e) {
                //如果有输入笔记,更新位置
                if (self._getNode('text').val().length > 0) {
                    self.setData(self._getNode('text').val());
                }
            });
        },
        /**
         * 注册事件监听
         * @ignore
         */
        _bindEvent: function() {
            var clickType,
                delEL = this._getNode('delete'),
                hideEl = this._getNode('hide'),
                textAreaEL = this._getNode('text');

            if (this.trigger[0] != document) {
                clickType = 'click';
            } else {
                clickType = 'dblclick';
            }
            this.trigger.on(clickType, this._triggerHandler, this);
            delEL.on('click', this._deleteHandler, this);
            hideEl.on('click', this._hideHandler, this);

            //定义输入监听处理函数
            this._valueChangeHandler();
            textAreaEL.on('valuechange', this.__vchandler, this);
        },
        /**
         * 触发节点的处理函数
         * @ignore
         */
        _triggerHandler: function() {
            this.show();
        },
        /**
         * 删除实例的处理函数
         * @ignore
         */
        _deleteHandler: function() {
            var self = this;
            self.removeData(function(data) {
                self.destroy();
            })
        },
        /**
         * 隐藏UI的处理函数
         * @ignore
         */
        _hideHandler: function() {
            this.hide();
        },
        /**
         * 监听笔记输入
         * @ignore
         */
        _valueChangeHandler: function() {
            var self = this;
            self.__vchandler = S.buffer(function(e){
                var target = e.currentTarget;
                var text = target.value;

                self.setData(text);
            }, 500);
        },
        /**
         * 保存数据
         * @param {String}   text     待缓存笔记文本
         * @param {Function} callback 回调函数
         */
        setData: function(text, callback) {
            var self = this,
                root = self._getNode(),
                value = {
                    title: self.get('title'),
                    prefixCls: self.get('prefixCls'),
                    text: text,
                    link: document.location.href,
                    postion: root.offset(),
                    id: new Date().getTime()
                },
                domain = '/' + document.domain;
            //是否按域保存
            if (location.href.indexOf(domain) > -1 && this.get('isCrossDomain')) {
                domain = this.get('domain');
            }
            storage.set({
                k: 'ksnote'+ domain,
                v: value,
                success: function(data) {
                    S.isFunction(callback) && callback.call(this, data);
                }
            });
        },
        /**
         * 获取数据
         * @param  {Function} callback 回调函数
         */
        getData: function(callback) {
            var self = this,
                domain = '/' + document.domain;
            if (location.href.indexOf(domain) > -1 && this.get('isCrossDomain')) {
                domain = this.get('domain');
            }
            storage.get({
                k: 'ksnote' + domain,
                success: function(data) {
                    if (data && !self.get('isShowOld')) {
                        data = undefined;
                    }
                    S.isFunction(callback) && callback.call(this, data);
                }
            })
        },
        /**
         * 移除本地数据
         * @param  {Function} callback 回调函数
         */
        removeData: function(callback) {
            var domain = '/' + document.domain;
            if (location.href.indexOf(domain) > -1 && this.get('isCrossDomain')) {
                domain = this.get('domain');
            }
            storage.remove({
                k: 'ksnote' + domain,
                success: function(data) {
                    S.isFunction(callback) && callback.call(this, data);
                }
            })
        },
        /**
         * 显示
         * @ignore
         */
        show: function() {
            var root = this._getNode();
            this.getData(function(data) {
                if (data) {
                    root.css({
                        left: data.postion.left,
                        top: data.postion.top,
                        visibility: 'visible'
                    });
                } else {
                    root.css('visibility', 'visible');
                }
            });
            
        },
        /**
         * 隐藏
         * @ignore
         */
        hide: function() {
            var root = this._getNode();
            root.css('visibility', 'hidden');
        },
        /**
         * 销毁,dom节点和事件
         * @ignore
         */
        destroy: function(isNeedClear) {
            var delEL = this._getNode('delete'),
                textAreaEL = this._getNode('text'),
                root = this._getNode();
            if (this.trigger[0] == document) {
                clickType = 'click';
            } else {
                clickType = 'dblClick';
            }
            //注销事件监听
            this.trigger.detach(clickType, this._triggerHandler);
            delEL.detach('click', this._deleteHandler);
            textAreaEL.detach('valuechange', this.__vchandler);
            root.remove();
            isNeedClear && self.removeData();
        },
        /**
         * @private 获取相关节点
         * @param  {String} noteEffect 关键字
         */
        _getNode: function(noteEffect) {
            var suffix = noteEffect ? 'note-' + noteEffect : 'note';
            return $('.' + this.get('prefixCls') + suffix);
        }
    });

    return Ksnote;
}, {
    requires:['node', 'base', 'dd', 'dd/plugin/proxy', 'gallery/storage/1.0/index']
});




