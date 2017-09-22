var CamlBuilder = function () {
    function b() { }
    b.prototype.Where = function () {
        return b.Internal.createWhere()
    };
    b.prototype.View = function (g) {
        return b.Internal.createView(g)
    };
    b.Expression = function () {
        return b.Internal.createExpression()
    };
    return b
}();
(function (b) {
    (function (a) {
        a[a.Recursive = 0] = "Recursive";
        a[a.RecursiveAll = 1] = "RecursiveAll";
        a[a.FilesOnly = 2] = "FilesOnly"
    })(b.ViewScope || (b.ViewScope = {}));
    (function (a) {
        a[a.Now = 0] = "Now";
        a[a.Day = 1] = "Day";
        a[a.Week = 2] = "Week";
        a[a.Month = 3] = "Month";
        a[a.Year = 4] = "Year"
    })(b.DateRangesOverlapType || (b.DateRangesOverlapType = {}));
    var g = function () {
        function a() { }
        a.createView = function (e) {
            return (new l).View(e)
        };
        a.createWhere = function () {
            return (new k).Where()
        };
        a.createExpression = function () {
            return new m(new p)
        };
        return a
    }();
    b.Internal = g;
    var l = function () {
        function a() {
            this.builder = new p
        }
        a.prototype.View = function (e) {
            this.builder.WriteStart("View");
            this.builder.unclosedTags++;
            if (e && 0 < e.length) {
                this.builder.WriteStart("ViewFields");
                for (var a = 0; a < e.length; a++) this.builder.WriteFieldRef(e[a]);
                this.builder.WriteEnd()
            }
            this.joinsManager = new v(this.builder, this);
            return this
        };
        a.prototype.RowLimit = function (e, a) {
            this.builder.WriteRowLimit(a || !1, e);
            return this
        };
        a.prototype.Scope = function (e) {
            this.builder.SetAttributeToLastElement("View",
                "Scope", e.toString());
            return this
        };
        a.prototype.InnerJoin = function (e, a) {
            return this.joinsManager.Join(e, a, "INNER")
        };
        a.prototype.LeftJoin = function (e, a) {
            return this.joinsManager.Join(e, a, "LEFT")
        };
        a.prototype.Select = function (e, a) {
            return this.joinsManager.ProjectedField(e, a)
        };
        a.prototype.ToString = function () {
            this.joinsManager.Finalize();
            return this.builder.Finalize()
        };
        a.prototype.ToCamlQuery = function () {
            this.joinsManager.Finalize();
            return this.builder.FinalizeToSPQuery()
        };
        a.prototype.Query = function () {
            this.joinsManager.Finalize();
            this.builder.WriteStart("Query");
            this.builder.unclosedTags++;
            return new k(this.builder)
        };
        return a
    }(),
        k = function () {
            function a(e) {
                this.builder = e || new p
            }
            a.prototype.Where = function () {
                this.builder.WriteStart("Where");
                this.builder.unclosedTags++;
                return new m(this.builder)
            };
            return a
        }(),
        v = function () {
            function a(e, a) {
                this.projectedFields = [];
                this.joins = [];
                this.originalView = a;
                this.builder = e
            }
            a.prototype.Finalize = function () {
                this.builder.WriteStart("Joins");
                for (var e = 0; e < this.joins.length; e++) {
                    var a = this.joins[e];
                    this.builder.WriteStart("Join", [{
                        Name: "Type",
                        Value: a.JoinType
                    }, {
                        Name: "ListAlias",
                        Value: a.Alias
                    }]);
                    this.builder.WriteStart("Eq");
                    this.builder.WriteFieldRef(a.RefFieldName, {
                        RefType: "ID"
                    });
                    this.builder.WriteFieldRef("ID", {
                        List: a.Alias
                    });
                    this.builder.WriteEnd();
                    this.builder.WriteEnd()
                }
                this.builder.WriteEnd();
                this.builder.WriteStart("ProjectedFields");
                for (e = 0; e < this.projectedFields.length; e++) a = this.projectedFields[e], this.builder.WriteStart("Field", [{
                    Name: "ShowField",
                    Value: a.FieldName
                }, {
                    Name: "Type",
                    Value: "Lookup"
                },
                    {
                        Name: "Name",
                        Value: a.Alias
                    }, {
                        Name: "List",
                        Value: a.JoinAlias
                    }
                ]), this.builder.WriteEnd();
                this.builder.WriteEnd()
            };
            a.prototype.Join = function (e, a, c) {
                this.joins.push({
                    RefFieldName: e,
                    Alias: a,
                    JoinType: c
                });
                return new w(this.builder, this)
            };
            a.prototype.ProjectedField = function (e, a) {
                this.projectedFields.push({
                    FieldName: e,
                    Alias: a,
                    JoinAlias: this.joins[this.joins.length - 1].Alias
                });
                return this.originalView
            };
            return a
        }(),
        w = function () {
            function a(e, a) {
                this.builder = e;
                this.joinsManager = a
            }
            a.prototype.Select = function (e, a) {
                return this.joinsManager.ProjectedField(e,
                    a)
            };
            a.prototype.InnerJoin = function (e, a) {
                return this.joinsManager.Join(e, a, "INNER")
            };
            a.prototype.LeftJoin = function (e, a) {
                return this.joinsManager.Join(e, a, "LEFT")
            };
            return a
        }(),
        h = function () {
            function a(e, a) {
                this.builder = e;
                this.startIndex = a
            }
            a.prototype.And = function () {
                this.builder.tree.splice(this.startIndex, 0, {
                    Element: "Start",
                    Name: "And"
                });
                this.builder.unclosedTags++;
                return new m(this.builder)
            };
            a.prototype.Or = function () {
                this.builder.tree.splice(this.startIndex, 0, {
                    Element: "Start",
                    Name: "Or"
                });
                this.builder.unclosedTags++;
                return new m(this.builder)
            };
            a.prototype.GroupBy = function (e, a) {
                this.builder.WriteStartGroupBy(e, a);
                return new x(this.builder)
            };
            a.prototype.OrderBy = function (a, d, c) {
                this.builder.WriteStartOrderBy(d, c);
                this.builder.WriteFieldRef(a);
                return new n(this.builder)
            };
            a.prototype.OrderByDesc = function (a, d, c) {
                this.builder.WriteStartOrderBy(d, c);
                this.builder.WriteFieldRef(a, {
                    Descending: !0
                });
                return new n(this.builder)
            };
            a.prototype.ToString = function () {
                return this.builder.Finalize()
            };
            a.prototype.ToCamlQuery = function () {
                return this.builder.FinalizeToSPQuery()
            };
            return a
        }(),
        m = function () {
            function a(a) {
                this.builder = a
            }
            a.prototype.TextField = function (a) {
                return new f(this.builder, a, "Text")
            };
            a.prototype.BooleanField = function (a) {
                return new f(this.builder, a, "Integer")
            };
            a.prototype.UrlField = function (a) {
                return new f(this.builder, a, "URL")
            };
            a.prototype.NumberField = function (a) {
                return new f(this.builder, a, "Number")
            };
            a.prototype.IntegerField = function (a) {
                return new f(this.builder, a, "Integer")
            };
            a.prototype.CounterField = function (a) {
                return new f(this.builder, a, "Counter")
            };
            a.prototype.UserField =
                function (a) {
                    return new r(this.builder, a)
                };
            a.prototype.LookupField = function (a) {
                return new s(this.builder, a)
            };
            a.prototype.LookupMultiField = function (a) {
                return new t(this.builder, a, 1)
            };
            a.prototype.UserMultiField = function (a) {
                return new t(this.builder, a, 0)
            };
            a.prototype.DateField = function (a) {
                return new f(this.builder, a, "Date")
            };
            a.prototype.DateTimeField = function (a) {
                return new f(this.builder, a, "DateTime")
            };
            a.prototype.DateRangesOverlap = function (a, d, c, b, f) {
                d = this.builder.tree.length;
                this.builder.WriteStart("DateRangesOverlap");
                this.builder.WriteFieldRef(c || "EventDate");
                this.builder.WriteFieldRef(b || "EndDate");
                this.builder.WriteFieldRef(f || "RecurrenceID");
                var g;
                switch (a) {
                    case 0:
                        g = q.Now;
                        break;
                    case 1:
                        g = q.Today;
                        break;
                    case 2:
                        g = "{Week}";
                        break;
                    case 3:
                        g = "{Month}";
                        break;
                    case 4:
                        g = "{Year}"
                }
                this.builder.WriteValueElement("DateTime", g);
                this.builder.WriteEnd();
                return new h(this.builder, d)
            };
            a.prototype.All = function () {
                for (var a = [], d = 0; d < arguments.length - 0; d++) a[d] = arguments[d + 0];
                d = this.builder.tree.length;
                1 == a.length && a[0] instanceof Array &&
                    (a = a[0]);
                a.reverse();
                for (var c = 0; c < a.length; c++) {
                    var b = a[c].builder;
                    0 < b.unclosedTags && b.WriteEnd(b.unclosedTags);
                    0 < c && (b.tree.splice(0, 0, {
                        Element: "Start",
                        Name: "And"
                    }), this.builder.WriteEnd());
                    Array.prototype.splice.apply(this.builder.tree, [d, 0].concat(b.tree))
                }
                return new h(this.builder, d)
            };
            a.prototype.Any = function () {
                for (var a = [], d = 0; d < arguments.length - 0; d++) a[d] = arguments[d + 0];
                d = this.builder.tree.length;
                1 == a.length && a[0] instanceof Array && (a = a[0]);
                a.reverse();
                for (var c = 0; c < a.length; c++) {
                    var b = a[c].builder;
                    0 < b.unclosedTags && b.WriteEnd(b.unclosedTags);
                    0 < c && (b.tree.splice(0, 0, {
                        Element: "Start",
                        Name: "Or"
                    }), this.builder.WriteEnd());
                    Array.prototype.splice.apply(this.builder.tree, [d, 0].concat(b.tree))
                }
                return new h(this.builder, d)
            };
            return a
        }(),
        u;
    (function (a) {
        a[a.UserMulti = 0] = "UserMulti";
        a[a.LookupMulti = 1] = "LookupMulti"
    })(u || (u = {}));
    var t = function () {
        function a(a, d, c) {
            this.builder = a;
            this.name = d;
            this.type = c;
            this.typeAsString = 0 == this.type ? "UserMulti" : "LookupMulti"
        }
        a.prototype.IncludesSuchItemThat = function () {
            return 1 ==
                this.type ? new s(this.builder, this.name) : new r(this.builder, this.name)
        };
        a.prototype.IsNull = function () {
            return (new f(this.builder, this.name, this.typeAsString, !1)).IsNull()
        };
        a.prototype.IsNotNull = function () {
            return (new f(this.builder, this.name, this.typeAsString, !1)).IsNotNull()
        };
        a.prototype.Includes = function (a) {
            return (new f(this.builder, this.name, this.typeAsString, !1)).EqualTo(a)
        };
        a.prototype.NotIncludes = function (a) {
            return (new f(this.builder, this.name, this.typeAsString, !1)).NotEqualTo(a)
        };
        a.prototype.EqualTo =
            function (a) {
                return (new f(this.builder, this.name, this.typeAsString, !1)).EqualTo(a)
            };
        a.prototype.NotEqualTo = function (a) {
            return (new f(this.builder, this.name, this.typeAsString, !1)).NotEqualTo(a)
        };
        return a
    }(),
        s = function () {
            function a(a, d) {
                this.builder = a;
                this.name = d
            }
            a.prototype.Id = function () {
                return new f(this.builder, this.name, "Integer", !0)
            };
            a.prototype.Value = function () {
                return new f(this.builder, this.name, "Lookup")
            };
            a.prototype.ValueAsText = function () {
                return new f(this.builder, this.name, "Text")
            };
            a.prototype.ValueAsNumber =
                function () {
                    return new f(this.builder, this.name, "Number")
                };
            a.prototype.ValueAsDateTime = function () {
                return new f(this.builder, this.name, "DateTime")
            };
            a.prototype.ValueAsDate = function () {
                return new f(this.builder, this.name, "Date")
            };
            a.prototype.ValueAsBoolean = function () {
                return new f(this.builder, this.name, "Integer")
            };
            return a
        }(),
        r = function () {
            function a(a, d) {
                var c = this;
                this.builder = a;
                this.name = d;
                this.startIndex = a.tree.length;
                this.Membership = {
                    CurrentUserGroups: function () {
                        return c.IsInCurrentUserGroups()
                    },
                    SPGroup: function (a) {
                        return c.IsInSPGroup(a)
                    },
                    SPWeb: {
                        AllUsers: function () {
                            return c.IsInSPWebAllUsers()
                        },
                        Users: function () {
                            return c.IsInSPWebUsers()
                        },
                        Groups: function () {
                            return c.IsInSPWebGroups()
                        }
                    }
                }
            }
            a.prototype.Id = function () {
                return new f(this.builder, this.name, "Integer", !0)
            };
            a.prototype.ValueAsText = function () {
                return new f(this.builder, this.name, "Text")
            };
            a.prototype.EqualToCurrentUser = function () {
                this.builder.WriteFieldRef(this.name, {
                    LookupId: !0
                });
                this.builder.WriteBinaryOperation(this.startIndex, "Eq", "Integer",
                    "{UserID}");
                return new h(this.builder, this.startIndex)
            };
            a.prototype.IsInCurrentUserGroups = function () {
                this.builder.WriteFieldRef(this.name);
                this.builder.WriteMembership(this.startIndex, "CurrentUserGroups");
                return new h(this.builder, this.startIndex)
            };
            a.prototype.IsInSPGroup = function (a) {
                this.builder.WriteFieldRef(this.name);
                this.builder.WriteMembership(this.startIndex, "SPGroup", a);
                return new h(this.builder, this.startIndex)
            };
            a.prototype.IsInSPWebGroups = function () {
                this.builder.WriteFieldRef(this.name);
                this.builder.WriteMembership(this.startIndex, "SPWeb.Groups");
                return new h(this.builder, this.startIndex)
            };
            a.prototype.IsInSPWebAllUsers = function () {
                this.builder.WriteFieldRef(this.name);
                this.builder.WriteMembership(this.startIndex, "SPWeb.AllUsers");
                return new h(this.builder, this.startIndex)
            };
            a.prototype.IsInSPWebUsers = function () {
                this.builder.WriteFieldRef(this.name);
                this.builder.WriteMembership(this.startIndex, "SPWeb.Users");
                return new h(this.builder, this.startIndex)
            };
            return a
        }(),
        f = function () {
            function a(a,
                d, c, b) {
                this.builder = a;
                this.name = d;
                this.startIndex = a.tree.length;
                this.valueType = c;
                this.builder.WriteFieldRef(d, {
                    LookupId: b
                })
            }
            a.prototype.IsTrue = function () {
                this.builder.WriteBinaryOperation(this.startIndex, "Eq", "Integer", "1");
                return new h(this.builder, this.startIndex)
            };
            a.prototype.IsFalse = function () {
                this.builder.WriteBinaryOperation(this.startIndex, "Eq", "Integer", "0");
                return new h(this.builder, this.startIndex)
            };
            a.prototype.IsNull = function () {
                this.builder.WriteUnaryOperation(this.startIndex, "IsNull");
                return new h(this.builder, this.startIndex)
            };
            a.prototype.IsNotNull = function () {
                this.builder.WriteUnaryOperation(this.startIndex, "IsNotNull");
                return new h(this.builder, this.startIndex)
            };
            a.prototype.EqualTo = function (a) {
                a instanceof Date && (a = a.toISOString());
                this.builder.WriteBinaryOperation(this.startIndex, "Eq", this.valueType, a);
                return new h(this.builder, this.startIndex)
            };
            a.prototype.GreaterThan = function (a) {
                a instanceof Date && (a = a.toISOString());
                this.builder.WriteBinaryOperation(this.startIndex, "Gt",
                    this.valueType, a);
                return new h(this.builder, this.startIndex)
            };
            a.prototype.LessThan = function (a) {
                a instanceof Date && (a = a.toISOString());
                this.builder.WriteBinaryOperation(this.startIndex, "Lt", this.valueType, a);
                return new h(this.builder, this.startIndex)
            };
            a.prototype.GreaterThanOrEqualTo = function (a) {
                a instanceof Date && (a = a.toISOString());
                this.builder.WriteBinaryOperation(this.startIndex, "Geq", this.valueType, a);
                return new h(this.builder, this.startIndex)
            };
            a.prototype.LessThanOrEqualTo = function (a) {
                a instanceof
                Date && (a = a.toISOString());
                this.builder.WriteBinaryOperation(this.startIndex, "Leq", this.valueType, a);
                return new h(this.builder, this.startIndex)
            };
            a.prototype.NotEqualTo = function (a) {
                a instanceof Date && (a = a.toISOString());
                this.builder.WriteBinaryOperation(this.startIndex, "Neq", this.valueType, a);
                return new h(this.builder, this.startIndex)
            };
            a.prototype.Contains = function (a) {
                this.builder.WriteBinaryOperation(this.startIndex, "Contains", this.valueType, a);
                return new h(this.builder, this.startIndex)
            };
            a.prototype.BeginsWith =
                function (a) {
                    this.builder.WriteBinaryOperation(this.startIndex, "BeginsWith", this.valueType, a);
                    return new h(this.builder, this.startIndex)
                };
            a.prototype.In = function (a) {
                this.builder.tree.splice(this.startIndex, 0, {
                    Element: "Start",
                    Name: "In"
                });
                this.builder.WriteStart("Values");
                for (var d = 0; d < a.length; d++) {
                    var c = a[d];
                    c instanceof Date && (c = c.toISOString());
                    this.builder.WriteValueElement(this.valueType, c)
                }
                this.builder.WriteEnd();
                this.builder.WriteEnd();
                return new h(this.builder, this.startIndex)
            };
            return a
        }(),
        x = function () {
            function a(a) {
                this.builder = a
            }
            a.prototype.OrderBy = function (a, d, c) {
                this.builder.WriteStartOrderBy(d, c);
                this.builder.WriteFieldRef(a);
                return new n(this.builder)
            };
            a.prototype.OrderByDesc = function (a, d, c) {
                this.builder.WriteStartOrderBy(d, c);
                this.builder.WriteFieldRef(a, {
                    Descending: !0
                });
                return new n(this.builder)
            };
            a.prototype.ToString = function () {
                return this.builder.Finalize()
            };
            a.prototype.ToCamlQuery = function () {
                return this.builder.FinalizeToSPQuery()
            };
            return a
        }(),
        n = function () {
            function a(a) {
                this.builder =
                    a
            }
            a.prototype.ThenBy = function (e, d, c) {
                this.builder.WriteFieldRef(e);
                return new a(this.builder)
            };
            a.prototype.ThenByDesc = function (e, d, c) {
                this.builder.WriteFieldRef(e, {
                    Descending: !0
                });
                return new a(this.builder)
            };
            a.prototype.ToString = function () {
                return this.builder.Finalize()
            };
            a.prototype.ToCamlQuery = function () {
                return this.builder.FinalizeToSPQuery()
            };
            return a
        }(),
        p = function () {
            function a() {
                this.tree = [];
                this.unclosedTags = 0
            }
            a.prototype.SetAttributeToLastElement = function (a, d, c) {
                for (var b = this.tree.length - 1; 0 <=
                    b; b--)
                    if ("View" == this.tree[b].Element) {
                        this.tree[b].Attributes = this.tree[b].Attributes || [];
                        this.tree[b].Attributes.push({
                            Name: d,
                            Value: c
                        });
                        return
                    }
                console.log("CamlJs ERROR: can't find element '" + a + "' in the tree while setting attribute " + d + " to '" + c + "'!")
            };
            a.prototype.WriteRowLimit = function (a, d) {
                a ? this.tree.push({
                    Element: "Start",
                    Name: "RowLimit",
                    Attributes: [{
                        Name: "Paged",
                        Value: "TRUE"
                    }]
                }) : this.tree.push({
                    Element: "Start",
                    Name: "RowLimit"
                });
                this.tree.push({
                    Element: "Raw",
                    Xml: d
                });
                this.tree.push({
                    Element: "End"
                })
            };
            a.prototype.WriteStart = function (a, d) {
                d ? this.tree.push({
                    Element: "Start",
                    Name: a,
                    Attributes: d
                }) : this.tree.push({
                    Element: "Start",
                    Name: a
                })
            };
            a.prototype.WriteEnd = function (a) {
                0 < a ? this.tree.push({
                    Element: "End",
                    Count: a
                }) : this.tree.push({
                    Element: "End"
                })
            };
            a.prototype.WriteFieldRef = function (a, d) {
                var c = {
                    Element: "FieldRef",
                    Name: a
                },
                    b;
                for (b in d || {}) c[b] = d[b];
                this.tree.push(c)
            };
            a.prototype.WriteValueElement = function (a, d) {
                "Date" == a ? this.tree.push({
                    Element: "Value",
                    ValueType: "DateTime",
                    Value: d,
                    IncludeTimeValue: !1
                }) :
                    this.tree.push({
                        Element: "Value",
                        ValueType: a,
                        Value: d
                    })
            };
            a.prototype.WriteMembership = function (a, d, b) {
                d = [{
                    Name: "Type",
                    Value: d
                }];
                b && d.push({
                    Name: "ID",
                    Value: b
                });
                this.tree.splice(a, 0, {
                    Element: "Start",
                    Name: "Membership",
                    Attributes: d
                });
                this.WriteEnd()
            };
            a.prototype.WriteUnaryOperation = function (a, b) {
                this.tree.splice(a, 0, {
                    Element: "Start",
                    Name: b
                });
                this.WriteEnd()
            };
            a.prototype.WriteBinaryOperation = function (a, b, c, g) {
                this.tree.splice(a, 0, {
                    Element: "Start",
                    Name: b
                });
                this.WriteValueElement(c, g);
                this.WriteEnd()
            };
            a.prototype.WriteStartGroupBy =
                function (a, b) {
                    if (0 < this.unclosedTags) {
                        var c = this.unclosedTags;
                        "Query" == this.tree[0].Name ? c-- : "View" == this.tree[0].Name && (c -= 2);
                        this.tree.push({
                            Element: "End",
                            Count: c
                        });
                        this.unclosedTags -= c
                    }
                    b ? this.tree.push({
                        Element: "Start",
                        Name: "GroupBy",
                        Attributes: [{
                            Name: "Collapse",
                            Value: "TRUE"
                        }]
                    }) : this.tree.push({
                        Element: "Start",
                        Name: "GroupBy"
                    });
                    this.tree.push({
                        Element: "FieldRef",
                        Name: a
                    });
                    this.WriteEnd()
                };
            a.prototype.WriteStartOrderBy = function (a, b) {
                if (0 < this.unclosedTags) {
                    var c = this.unclosedTags;
                    "Query" == this.tree[0].Name ?
                        c-- : "View" == this.tree[0].Name && (c -= 2);
                    this.tree.push({
                        Element: "End",
                        Count: c
                    });
                    this.unclosedTags -= c
                }
                c = [];
                a && c.push({
                    Name: "Override",
                    Value: "TRUE"
                });
                b && c.push({
                    Name: "UseIndexForOrderBy",
                    Value: "TRUE"
                });
                0 < c.length ? this.tree.push({
                    Element: "Start",
                    Name: "OrderBy",
                    Attributes: c
                }) : this.tree.push({
                    Element: "Start",
                    Name: "OrderBy"
                });
                this.unclosedTags++
            };
            a.prototype.Finalize = function () {
                for (var a = new window.Sys.StringBuilder, b = window.SP.XmlWriter.create(a), c = 0; c < this.tree.length; c++)
                    if ("FieldRef" == this.tree[c].Element) {
                        b.writeStartElement("FieldRef");
                        b.writeAttributeString("Name", this.tree[c].Name);
                        this.tree[c].LookupId && b.writeAttributeString("LookupId", "True");
                        this.tree[c].Descending && b.writeAttributeString("Ascending", "False");
                        for (var g in this.tree[c]) "Element" != g && "Name" != g && "LookupId" != g && "Descending" != g && b.writeAttributeString(g, this.tree[c][g]);
                        b.writeEndElement()
                    } else if ("Start" == this.tree[c].Element) {
                        if (b.writeStartElement(this.tree[c].Name), this.tree[c].Attributes)
                            for (var f = 0; f < this.tree[c].Attributes.length; f++) b.writeAttributeString(this.tree[c].Attributes[f].Name,
                                this.tree[c].Attributes[f].Value)
                    } else if ("Raw" == this.tree[c].Element) b.writeRaw(this.tree[c].Xml);
                    else if ("Value" == this.tree[c].Element) b.writeStartElement("Value"), !1 === this.tree[c].IncludeTimeValue && b.writeAttributeString("IncludeTimeValue", "False"), b.writeAttributeString("Type", this.tree[c].ValueType), f = this.tree[c].Value.toString(), "{" == f.slice(0, 1) && "}" == f.slice(-1) ? b.writeRaw("<" + f.slice(1, f.length - 1) + " />") : b.writeString(f), b.writeEndElement();
                    else if ("End" == this.tree[c].Element)
                        if (f = this.tree[c].Count)
                            for (; 0 <
                                f;) f--, b.writeEndElement();
                        else b.writeEndElement();
                for (; 0 < this.unclosedTags;) this.unclosedTags--, b.writeEndElement();
                this.tree = [];
                b.close();
                return a.toString()
            };
            a.prototype.FinalizeToSPQuery = function () {
                var a = this.Finalize(),
                    b = new window.SP.CamlQuery;
                b.set_viewXml("<View><Query>" + a + "</Query></View>");
                return b
            };
            return a
        }(),
        q = function () {
            function a() { }
            a.TodayWithOffset = function (a) {
                return '{Today OffsetDays="' + a + '"}'
            };
            a.UserID = "{UserID}";
            a.Today = "{Today}";
            a.Now = "{Now}";
            a.ListProperty = {
                Created: '{ListProperty Name="Created"}',
                DefaultViewUrl: '{ListProperty Name="DefaultViewUrl"}',
                Description: '{ListProperty Name="Description"}',
                EnableSyndication: '{ListProperty Name="EnableSyndication"}',
                ItemCount: '{ListProperty Name="ItemCount"}',
                LinkTitle: '{ListProperty Name="LinkTitle"}',
                MajorVersionLimit: '{ListProperty Name="MajorVersionLimit"}',
                MajorWithMinorVersionsLimit: '{ListProperty Name="MajorWithMinorVersionsLimit"}',
                RelativeFolderPath: '{ListProperty Name="RelativeFolderPath"}',
                Title: '{ListProperty Name="Title"}',
                ViewSelector: '{ListProperty Name="ViewSelector"}'
            };
            a.ProjectProperty = {
                BlogCategoryTitle: '{ProjectProperty Name="BlogCategoryTitle"}',
                BlogPostTitle: '{ProjectProperty Name="BlogPostTitle"}',
                Description: '{ProjectProperty Name="Description"}',
                RecycleBinEnabled: '{ProjectProperty Name="RecycleBinEnabled"}',
                SiteOwnerName: '{ProjectProperty Name="SiteOwnerName"}',
                SiteUrl: '{ProjectProperty Name="SiteUrl"}',
                Title: '{ProjectProperty Name="Title"}',
                Url: '{ProjectProperty Name="Url"}'
            };
            return a
        }();
    b.CamlValues = q
})(CamlBuilder || (CamlBuilder = {}));
if ("undefined" == typeof window.Sys || null == window.Sys) {
    var Sys$StringBuilder$toString = function (b) {
        b = b || "";
        var g = this._parts;
        this._len !== g.length && (this._value = {}, this._len = g.length);
        var l = this._value;
        if ("undefined" === typeof l[b]) {
            if ("" !== b)
                for (var k = 0; k < g.length;) "undefined" === typeof g[k] || "" === g[k] || null === g[k] ? g.splice(k, 1) : k++;
            l[b] = this._parts.join(b)
        }
        return l[b]
    },
        Sys$StringBuilder$isEmpty = function () {
            return 0 === this._parts.length ? !0 : "" === this.toString()
        },
        Sys$StringBuilder$clear = function () {
            this._parts = [];
            this._value = {};
            this._len = 0
        },
        Sys$StringBuilder$appendLine = function (b) {
            this._parts[this._parts.length] = "undefined" === typeof b || null === b || "" === b ? "\r\n" : b + "\r\n"
        },
        Sys$StringBuilder$append = function (b) {
            this._parts[this._parts.length] = b
        };
    window.Sys = {};
    window.Sys.StringBuilder = function (b) {
        this._parts = "undefined" !== typeof b && null !== b && "" !== b ? [b.toString()] : [];
        this._value = {};
        this._len = 0
    };
    window.Sys.StringBuilder.prototype = {
        append: Sys$StringBuilder$append,
        appendLine: Sys$StringBuilder$appendLine,
        clear: Sys$StringBuilder$clear,
        isEmpty: Sys$StringBuilder$isEmpty,
        toString: Sys$StringBuilder$toString
    }
}
if ("undefined" == typeof window.SP) {
    var SP_ScriptUtility$isNullOrEmptyString = function (b) {
        return null === b || "undefined" === typeof b || !b.length
    };
    window.SP = {};
    window.SP.XmlWriter = function (b) {
        this.$f_0 = [];
        this.$1_0 = b;
        this.$V_0 = !0
    };
    window.SP.XmlWriter.create = function (b) {
        return new window.SP.XmlWriter(b)
    };
    window.SP.XmlWriter.prototype = {
        $1_0: null,
        $11_0: null,
        $V_0: !1,
        $k_0: !1,
        writeStartElement: function (b) {
            this.$1R_0();
            this.$1A_0();
            this.$f_0.push(b);
            this.$11_0 = b;
            this.$1_0.append("<");
            this.$1_0.append(b);
            this.$k_0 =
                this.$V_0 = !1
        },
        writeElementString: function (b, g) {
            this.$1R_0();
            this.$1A_0();
            this.writeStartElement(b);
            this.writeString(g);
            this.writeEndElement()
        },
        writeEndElement: function () {
            this.$1R_0();
            if (SP_ScriptUtility$isNullOrEmptyString(this.$11_0)) throw "Invalid operation";
            this.$V_0 ? (this.$1_0.append("</"), this.$1_0.append(this.$11_0), this.$1_0.append(">")) : (this.$1_0.append(" />"), this.$V_0 = !0);
            this.$f_0.pop();
            this.$11_0 = 0 < this.$f_0.length ? this.$f_0[this.$f_0.length - 1] : null
        },
        $1A_0: function () {
            this.$V_0 || (this.$1_0.append(">"),
                this.$V_0 = !0)
        },
        writeAttributeString: function (b, g) {
            if (this.$V_0) throw "Invalid operation";
            this.$1_0.append(" ");
            this.$1_0.append(b);
            this.$1_0.append('="');
            this.$1T_0(g, !0);
            this.$1_0.append('"')
        },
        writeStartAttribute: function (b) {
            if (!this.$V_0) throw "Invalid operation";
            this.$k_0 = !0;
            this.$1_0.append(" ");
            this.$1_0.append(b);
            this.$1_0.append('="')
        },
        writeEndAttribute: function () {
            if (!this.$k_0) throw "Invalid operation";
            this.$1_0.append('"');
            this.$k_0 = !1
        },
        writeString: function (b) {
            this.$k_0 ? (this.$1T_0(b, !0), this.$1_0.append(b)) :
                (this.$1A_0(), this.$1T_0(b, !1))
        },
        writeRaw: function (b) {
            this.$1R_0();
            this.$1A_0();
            this.$1_0.append(b)
        },
        $1R_0: function () {
            if (this.$k_0) throw "Invalid operation";
        },
        $1T_0: function (b, g) {
            if (!SP_ScriptUtility$isNullOrEmptyString(b))
                for (var l = 0; l < b.length; l++) {
                    var k = b.charCodeAt(l);
                    62 === k ? this.$1_0.append("&gt;") : 60 === k ? this.$1_0.append("&lt;") : 38 === k ? this.$1_0.append("&amp;") : 34 === k && g ? this.$1_0.append("&quot;") : 39 === k && g ? this.$1_0.append("&apos;") : 9 === k && g ? this.$1_0.append("&#09;") : 10 === k ? this.$1_0.append("&#10;") :
                        13 === k ? this.$1_0.append("&#13;") : this.$1_0.append(b.charAt(l).toString())
                }
        },
        close: function () { }
    }
};