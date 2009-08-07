use Module::Build::JSAN::Installable;

my $build = Module::Build::JSAN::Installable->new(
	module_name    => 'JooseX.Meta.Lazy',
	create_makefile_pl => 'passthrough',
	dist_version   => 0.01,
	dist_author   => 'SamuraiJack',
	dist_abstract  => "Role to make metaclass 'lazy'",
	license        => 'perl',
);

$build->create_build_script;

