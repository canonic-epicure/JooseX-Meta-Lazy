StartTest(function(t) {
	t.plan(10)
	
    //==================================================================================================================================================================================
    t.diag("Lazy meta")    
    
    t.ok(JooseX.Meta.Lazy, "JooseX.Meta.Lazy is here")    
    

    //==================================================================================================================================================================================
    t.diag("Defining lazy metaclasses")    
    
    Class('TestMetaClass', {
    	meta : Joose.Meta.Class,
    	
    	isa : Joose.Meta.Class,
    	
    	does : [ JooseX.Meta.Lazy ]
    })    
    

    Class('TestMetaRole', {
    	meta : Joose.Meta.Class,
    	
    	isa : Joose.Meta.Role,
    	
    	does : [ JooseX.Meta.Lazy ]
    })    
    

    //==================================================================================================================================================================================
    t.diag("Creation")    
    
    Class('SuperClass', {
    	meta : TestMetaClass,
    	
    	have : {
    		res : 'sup:res'
    	},
    	
    	methods : {
    		process : function () { return 'sup:process' }
    	}
    })    
    t.ok(SuperClass, 'SuperClass class was created')    

    
    Role('Resource', {
    	meta : TestMetaRole,
    	
    	have : {
    		res : 'role:res'
    	},
    	
    	methods : {
    		process : function () { return 'role:process' }
    	}
    })    
    t.ok(Resource, "Role 'Resource' was created")    

    
    //will inhetit the same meta
    Class('SubClass', {
    	isa : SuperClass,
    	
    	does : [ Resource ]
    })    
    t.ok(SubClass, 'SubClass class was created')    

    

    //==================================================================================================================================================================================
    t.diag("Under construction state")    
    
    t.throws_ok(function() {
        SuperClass.meta.hasAttribute('res')    
    }, "this.stem is null", "'SuperClass even have no stem yet")

    
    t.throws_ok(function() {
        Resource.meta.hasAttribute('res')    
    }, "this.stem is null", "'Resource even have no stem yet")
    
    
    //==================================================================================================================================================================================
    t.diag("Lazy construction")    
    
    var subclass = new SubClass()    
    
    t.ok(SuperClass.meta.hasAttribute('res') && SuperClass.meta.hasMethod('process'), "SuperClass was correctly constructed")    
    t.ok(Resource.meta.hasAttribute('res') && Resource.meta.hasMethod('process'), "Resource was correctly constructed")    
    
    t.ok(SubClass.meta.hasAttribute('res') && subclass.res == 'role:res', "SubClass was correctly constructed #1")    
    t.ok(SubClass.meta.hasMethod('process') && subclass.process() == 'role:process', "SubClass was correctly constructed #2")    
})    