Role('JooseX.Meta.Lazy', {
    
    have : {
        pendedProps                 : null,
        originalConstructor         : null,
        
        isEager                     : false
    },
    
    
    
    before : {
        
        prepareProps : function (extend) {
            if (extend.eager) this.isEager = true
            delete extend.eager
        },

        
        extend : function (props) {
            if (this.pending) this.finalize()
        }
        
    },
    
    
    after : {
        
        adaptConstructor: function (c) {
            c.getMeta = function () {
                var meta = this.meta
                if (meta.pending) meta.finalize()
                
                return meta
            }        
        }
        
    },
    
    
    override : {
        
        extractConstructor : function (extend) {
            var originalConstructor = this.SUPER(extend)
            
            this.adaptConstructor(originalConstructor)
            
            return function () {
                var thisMeta = arguments.callee.meta    
                
                if (thisMeta.pending) thisMeta.finalize()    
                
                return originalConstructor.apply(this, arguments)    
            }
        },
        
        //is not re-entrant
        finalize : function (props) {
            if (this.isEager) return this.SUPER(props)
            
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
                        var role = (arg.meta instanceof Joose.Managed.Class) ? arg : arg.role    
                        
                        var roleMeta = role.meta
                        
                        if (roleMeta.meta.hasAttribute('pending') && roleMeta.pending) roleMeta.finalize()    
                    })
                },
                
                finalize : function (extend) {
                    if (!(this instanceof Joose.Managed.Role) && this.superClass != this.defaultSuperClass) {
                        
                        var superMeta = this.superClass.meta
                        
                        if (superMeta && superMeta.meta.hasAttribute('pending') && superMeta.pending) superMeta.finalize()
                    }
                }
            }
        })
        
        Joose.Managed.Bootstrap.meta.extend({
            does : LazyChecker
        })
        
        Joose.Namespace.Manager.my.register('LazyClass', Class('Class', {
            isa     : Joose.Meta.Class,
            meta    : Joose.Meta.Class,
            
            does    : JooseX.Meta.Lazy
        }))
        
        Joose.Namespace.Manager.my.register('LazyRole', Class('Role', {
            isa     : Joose.Meta.Role,
            meta    : Joose.Meta.Class,
            
            does    : JooseX.Meta.Lazy
        }))
    }
    
})    



/**

Name
====


JooseX.Meta.Lazy - A trait to make your metaclasses lazy


SYNOPSIS
========

        Role("Some.Lazy.Role", {
            
            trait : JooseX.Meta.Lazy,
            
            
            has : {
                ...
            },
            
            
            methods : {
                ...
            }
        })

        Class("Some.Lazy.Class", {
            
            trait : JooseX.Meta.Lazy,
            
            does : Some.Lazy.Role
            
            
            has : {
                ...
            },
            
            
            methods : {
                ...
            }
        })
        
        // your class and role will be actually created only in this call
        var instance = new Some.Lazy.Class({
        })
        
        
        // alternative declaration - no traits required

        LazyRole("Some.Lazy.Role", {
            ...
        })

        LazyClass("Some.Lazy.Class", {
            ...
        })


DESCRIPTION
===========

`JooseX.Meta.Lazy` is a meta-role, making your class (or role) lazy. "Lazy" here means, that the creation of the
metaclass instance will be deferred until the first instantiation of class (or first consumption of role).

If you have a *big* class hierarchy (like the [bridged ExtJS hierarchy](http://openjsan.org/go?l=JooseX.Bridge.Ext) for example or your own framework), 
this module can reduce the initialization time.

You can apply it as a trait (the 1st example in the synopsys), or you can use the new declaration helpers: `LazyClass` or `LazyRole`


INHERITANCE
===========

Note, that by default, subclasses uses the same metaclass as their parents. Thus, if you'll subclass the lazy class, the resulting class will be 
also lazy. If you'd like to avoid this, see the next section for details.  


`eager` BUILDER
===============

If you are using the lazy metaclass and still wants to create a normal class, you can use new builder `eager` for that:

        Class("Some.Lazy.Class", {
            trait : JooseX.Meta.Lazy,
            
            ...
        })
        
        
        Class("Some.Eager.Class", {
            isa : Some.Lazy.Class // will provide the lazy meta for this class
            
            eager : true // will create class immediately
        })



GETTING HELP
============

This extension is supported via github issues tracker: <http://github.com/SamuraiJack/JooseX-Meta-Lazy/issues>

For general Joose questions you can also visit #joose on irc.freenode.org or the forum at: <http://joose.it/forum>
 


SEE ALSO
========

Web page of this module: <http://github.com/SamuraiJack/JooseX-Meta-Lazy/>

General documentation for Joose: <http://openjsan.org/go/?l=Joose>


BUGS
====

All complex software has bugs lurking in it, and this module is no exception.

Please report any bugs through the web interface at <http://github.com/SamuraiJack/JooseX-Meta-Lazy/issues>



ACKNOWLEDGMENTS
===============

Many thanks to Malte Ubl for the idea of this module.


AUTHORS
=======

Nickolay Platonov <nplatonov@cpan.org>



COPYRIGHT AND LICENSE
=====================

Copyright (c) 2009, Nickolay Platonov

All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of Nickolay Platonov nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 


*/
