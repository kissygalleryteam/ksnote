## 综述

ksnote是。

* 版本：2.0.0
* 作者：肖涛
* 标签：
* demo：[http://kg.kissyui.com/ksnote/2.0.0/demo/index.html](http://kg.kissyui.com/ksnote/2.0.0/demo/index.html)

## 特别说明：
* 该组件依赖@鬼道-[http://kg.kissyui.com/storage/1.1/guide/index.html](storage)
* 充分利用storage做点事情..
* 保存笔记中含有坐标信息和保存页的页面链接,只要本地有数据则会显示在最后一次的坐标位置处.
* 本地有数据时,默认在同域下其他页面引入组件也能看到笔记内容.

## 引用Kissy文件
    <script src="http://a.tbcdn.cn/s/kissy//1.3.0/kissy-min.js"></script>
> 或者
    <script src="http://a.tbcdn.cn/s/kissy//1.3.0/seed-min.js"></script>
## 初始化组件

    S.use('kg/ksnote/2.0.0/index', function (S, Ksnote) {
        var ksnote = new Ksnote(trigger, {
            title: 'xxx',    //可忽略
            prefixCls: 'ks-' //可忽略
        });
    })

## API说明
默认会在输入状态下对值进行保存

### 设置初始样式
    .ks-note{
        position: absolute;
        visibility: hidden;
    }

### 静态属性
* title: 标题名称
* prefixCls: 样式前缀, 用户端配置样式
* isCrossDomain: 是否跨域访问。开启后,不在同一域下将无法获得缓存数据
* domain: 开启跨域访问后,需要指定数据指向域
* isShowOld: 当本地有数据时,是否显示旧的笔记
### 方法
#### setData(text, callback) | [String, Function]
保存笔记内容. 传入待保存内容,保存的数据会在回调函数中以参数形式返回

#### getData(callback) | [Function]
获取笔记内容. 数据会在回调函数中以参数形式返回

#### removeData(callback) | [Function]
删除笔记内容, 注意默认只删除同域下的数据(如未配置)

#### show()
显示笔记UI

#### hide()
隐藏笔记UI

#### destroy(isNeedClear) | [Boolean]
销毁笔记,isNeedClear为’true‘时同时会清除数据

### TODO
 1. 优化多实例添加的数据区分问题
