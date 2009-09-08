Role('JooseX.Meta.Lazy', {
    
    have : {
        pendedProps                 : null,
        originalConstructor         : null
    },
    
    
    
    before : {
        
        extend : function (props) {
            if (this.pending) this.construct()
        }
        
    },
    
    
    after : {
        
        extractConstructor : function () {
            var originalConstructor = this.originalConstructor = this.c
            originalConstructor.meta = this
            
            this.c = function () {
                var thisMeta = this.meta    
                
                if (thisMeta.pending) thisMeta.construct()    
                
                originalConstructor.apply(this, arguments)    
            }
        }
        
    },
    
    
    override : {
        
        construct : function (props) {
            
            //1st call to 'construct' - we are not 'pending' yet (though we should be, as we are Lazy class) 
            //need to construct as little as possible and switch to 'pending' mode
            if (!this.pending) {
                this.pending = true
                this.pendedProps = props
                
                this.extractSuperClass(props)
                this.processSuperClass()
                this.adaptPrototype()
                
                return    
            }
            
            //2nd call to construct - we are in 'pending mode' need to construct the class
            var pendedProps = this.pendedProps
            delete this.pendedProps
            this.pending = false
            
            this.SUPER(pendedProps)
        },
        

        //this only needs to be done once - in the initial pass
        processSuperClass: function (extend) {
            if (this.pending) this.SUPER(extend)
        },
        
        
        //this only needs to be done once - in the initial pass
        adaptPrototype: function () {
            if (this.pending) this.SUPER()
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
                    if (!this.pending)
                        Joose.A.each(arguments, function(arg) {
                            var role = (arg.meta instanceof Joose.Managed.Role) ? arg : arg.role    
                            
                            var roleMeta = role.meta    
                            
                            if (roleMeta.meta.hasAttribute('pending') && roleMeta.pending) roleMeta.construct()    
                        })
                }
            },
            
            
            override : {
                
                extractSuperClass : function (extend) {
                    if (!this.superClass || this.pending) this.SUPER(extend)
                    
                    if (!this.pending)
                        if (!(this instanceof Joose.Managed.Role) && this.superClass != Joose.Proto.Object) {
                            
                            var superMeta = this.superClass.meta
                            
                            if (superMeta.meta.hasAttribute('pending') && superMeta.pending) superMeta.construct()
                        }
                }
            }
        })
        
        Joose.Managed.Bootstrap.meta.extend({
            does : LazyChecker
        })
        
        var LazyClass = Class('Class', {
            isa     : Joose.Meta.Class,
            meta    : Joose.Meta.Class,
            
            does    : JooseX.Meta.Lazy
        })
        
        var LazyRole = Role('Role', {
            isa     : Joose.Meta.Role,
            meta    : Joose.Meta.Class,
            
            does    : JooseX.Meta.Lazy
        })
        
        Joose.Helper.my.register('LazyClass', LazyClass)
        Joose.Helper.my.register('LazyRole', LazyRole)
    }
    
})    

