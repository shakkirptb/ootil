/**
 * @author Muhammed Shakkir Thalikunnath <shakkirptb@gmail.com>
 * */
var Node = require("node4node");
const ootil = {};

Object.defineProperty(Array.prototype, "unique", {
    value: function() {
        var a = [];
        for (i = 0; i < this.length; i++) {
            var current = this[i];
            if (a.indexOf(current) < 0) a.push(current);
        }
        return a;
    }
});
Object.defineProperty(Array.prototype, "intersection", {
    value: function(array2) {
        if (array2 != null && array2 instanceof Array) {
            if (this == array2) {
                return this;
            }
            return this.filter(function(item) {
                return array2.indexOf(item) !== -1;
            });
        }
        return [];
    }
});
Object.defineProperty(Array.prototype, "getType", {
    value: function(type) {
        if (type != null) {
            return this.filter(function(item) {
                return item.isA == type;
            });
        }
        return this.filter(function(item) {
            return item.isA == konst.TYPE;
        });
    }
});

ootil.isNode = function($this) {
    return $this instanceof Node;
    //	return $this!=null && $this.hasOwnProperty('isA');
}
Object.defineProperty(Array.prototype, "getShallow", {
    value: function(deeper) {
        let op = [];
        for (item of this) {
            if (ootil.isNode(item)) {
                let node = item.getShallow(deeper);
                if (node != null) {
                    op.push(node);
                }
            } else if (item != null) {
                op.push(item);
            }
        }
        return op;
    }
});
/**
 * query an array of objects
 * */

Object.defineProperty(Array.prototype, "select", {
    value: function(select) {
        var res = [];
        var op = {};
        if (select instanceof Object && !ootil.isNode(select)) {
            //fill default values
            for (opr in select) {
                let def;
                let item = op[select[opr]] || {};

                switch (opr) {
                    case "*":
                        item[opr] = [];
                        break;
                    case "$count":
                    case "$sum":
                        item[opr] = 0;
                        break;
                }
                op[select[opr]] = item
            }
            //kept for first items
            console.log("op", op);
            for (item of this) {
                for (opr in select) {
                    if (item.hasOwnProperty(select[opr])) {
                        switch (opr) {
                            case "$sum":
                                let val = Number(item[select[opr]]);
                                if (!isNaN(val)) {
                                    op[select[opr]][opr] += val
                                }
                                break;
                                //						console.log("$sum",this.reduce((a, b) => isNaN(b[select.$sum]) ? a : a + b, 0));
                                //				return this.map(a => a[select.$sum]).reduce((a, b) => a + b, 0);
                                //						return this.reduce((a, b) => (isNaN(b[select.$sum]) ? a : a + b), 0);
                        }
                    }
                }

            }
            //kept for last methods
            for (opr in select) {
                switch (opr) {
                    case "$count":
                        console.log("len", this.length);
                        op[select[opr]][opr] = this.length;
                }
            }
            console.log("op", op);
            return op;
        }
        return this;
    }
});
Object.defineProperty(Array.prototype, "query", {
    value: function(where) {
        try {
            return this.filter(function(item) {
                for (atr in where) {
                    var qAttr = where[atr]; //will never be undefined
                    var iAttr = item[atr];
                    if (iAttr === qAttr) {
                        continue;
                    }
                    if (iAttr === undefined ||
                        (ootil.isNode(iAttr) && ootil.isNode(qAttr) && iAttr !== qAttr)) {
                        return false;
                    }
                    if (iAttr != null) {
                        var val = iAttr;
                        if (ootil.isNode(iAttr)) {
                            val = iAttr.id;
                        }
                        if (qAttr instanceof Object) {
                            for (opr in qAttr) {
                                var oprVal = qAttr[opr];
                                if (!ootil.operate(val, opr, oprVal)) {
                                    return false;
                                }
                            }
                        } else if (qAttr != val) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
                return true;
            });
        } catch (e) {
            console.log("ERROR in Array.query: ", e);
        }
        return [];
    }
});
ootil.regExpTest = function(val, oprVal) {
    try {
        if (oprVal.startsWith('/')) {
            var ind = oprVal.lastIndexOf('/');
            var regEx = oprVal.substr(1, ind - 1);
            var flag = oprVal.substr(ind + 1);
            return new RegExp(regEx, flag).test(val)
        }
    } catch (e) {
        throw e;
    }
    return false;
}
ootil.operate = function(val, opr, oprVal) {
    switch (opr) {
        case "$imatch":
            return ootil.regExpTest(val, "/" + oprVal + "/i");
        case "$i":
            return ootil.regExpTest(val, "/^" + oprVal + "$/i");
        case "$regex":
            return ootil.regExpTest(val, oprVal);
        case "$eq":
            return val == oprVal;
        case "$gt":
            return val > oprVal;
        case "$lt":
            return val < oprVal
        case "$ge":
            return val >= oprVal;
        case "$le":
            return val <= oprVal;
        case "$in":
            return oprVal.indexOf(val) != -1;
        default:
            return false;
    }
    return false;
}

ootil.getShallow = function($this, deeper) {
    if ($this instanceof Array) {
        return $this.getShallow(deeper);
    }
    return Node.getShallow($this, deeper);
}
//export
module.exports = ootil;