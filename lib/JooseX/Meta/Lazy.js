Role('JooseX.Meta.Lazy', {
    
    have : {
        pendedProps                 : null,
        originalConstructor         : null
    },
    
    
    
    before : {
        
        extend : function (props) {
            if (this.pending) this.finalize()
        }
        
    },
    
    
    after : {
        
        extractConstructor : function () {
            var originalConstructor = this.originalConstructor = this.c
            originalConstructor.meta = this
            
            this.c = function () {
                var thisMeta = this.meta    
                
                if (thisMeta.pending) thisMeta.finalize()    
                
                originalConstructor.apply(this, arguments)    
            }
        },
        
        
        adaptConstructor: function () {
            this.c.getMeta = function () {
                var meta = this.meta
                if (meta.pending) meta.finalize()
                
                return meta
            }        
        }
        
    },
    
    
    override : {
        
        //is not re-entrant
        finalize : function (props) {
            if (!this.pending) {
                
                this.pending = true
                this.pendedProps = props
                
                return
            }
            
            this.pending = false
            
            this.SUPER(this.pendedProps)
            delete this.pendedProps
        }
        
    },
    
    
    body : function () {
        
        //lazy checker will be installed system wide (into Joose.Managed.Bootstrap) to monitor for each usual class
        //whether the superclass or a role being added is lazy 
        var LazyChecker = Role({
            meta : Joose.Managed.Role,
            
            have : {
                pending                     : false
            },
            
            before : {
                
                addRole : function () {
                    Joose.A.each(arguments, function(arg) {
                        var role = (arg.meta instanceof Joose.Managed.Role) ? arg : arg.role    
                        
                        var roleMeta = role.meta    
                        
                        if (roleMeta.meta.hasAttribute('pending') && roleMeta.pending) roleMeta.finalize()    
                    })
                },
                
                finalize : function (extend) {
                    if (!(this instanceof Joose.Managed.Role) && this.superClass != Joose.Proto.Object) {
                        
                        var superMeta = this.superClass.meta
                        
                        if (superMeta && superMeta.meta.hasAttribute('pending') && superMeta.pending) superMeta.finalize()
                    }
                }
            }
        })
        
        Joose.Managed.Bootstrap.meta.extend({
            does : LazyChecker
        })
        
        Joose.Helper.my.register('LazyClass', Class({
            isa     : Joose.Meta.Class,
            meta    : Joose.Meta.Class,
            
            does    : JooseX.Meta.Lazy
        }))
        
        Joose.Helper.my.register('LazyRole', Class({
            isa     : Joose.Meta.Role,
            meta    : Joose.Meta.Class,
            
            does    : JooseX.Meta.Lazy
        }))
    }
    
})    

