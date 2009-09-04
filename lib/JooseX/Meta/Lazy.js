Role('JooseX.Meta.Lazy', {
    
    have : {
        pending : false,
        pendedProps : null,
        originalConstructor : null
    },
    
    
    
    before : {
        
        addRole : function () {
            Joose.A.each(arguments, function(arg) {
                var role = (arg.meta instanceof Joose.Managed.Role) ? arg : arg.role    
                
                var roleMeta = role.meta    
                
                if (roleMeta.meta.hasAttribute('pending') && roleMeta.pending) roleMeta.construct()    
            })
        }
        
    },
    
    
    after : {
        
        extractConstructor : function () {
            var originalConstructor = this.originalConstructor = this.c
            
            this.c = function () {
                var thisMeta = this.meta    
                
                if (thisMeta.pending) thisMeta.construct()    
                
                originalConstructor.apply(this, arguments)    
            }
        },
        
        
        adaptConstructor: function () {
            this.originalConstructor.meta = this
        }
        
        
    },
    
    
    override : {
        
        extend : function (props) {
            if (this.pendedProps) this.construct()
            
            this.SUPER(props)
        },
        
        
        construct : function (props) {
            
            //need to construct as little as possible to switch to 'pending' mode
            if (!this.pending) {
                this.extractSuperClass(props)
                this.processSuperClass()
                this.adaptPrototype()
                
                this.pending = true
                this.pendedProps = props
                return    
            }
            
            var pendedProps = this.pendedProps
            delete this.pendedProps
            
            this.SUPER(pendedProps)
            
            this.pending = false
        },
        

        extractSuperClass : function (extend) {
            if (this.pending) {
                if (!(this instanceof Joose.Managed.Role) && this.superClass != Joose.Proto.Object) {
                    
                    var superMeta = this.superClass.meta
                    
                    if (superMeta.meta.hasAttribute('pending') && superMeta.pending) superMeta.construct()
                }
            } else
                this.SUPER(extend)
        },
        
        
        processSuperClass: function (extend) {
            if (!this.pending) this.SUPER(extend)
        },
        
        
        adaptPrototype: function () {
            if (!this.pending) this.SUPER()
        }
        
        
    }
    
})    
