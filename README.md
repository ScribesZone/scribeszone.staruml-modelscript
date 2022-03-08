ModelScript plugin for StarUML
==============================

**Preliminary version** of [ModelScript](https://modelscript.readthedocs.io/en/latest/) plugin for [StarUML](https://staruml.io/) environment. 
Class and object models propulsed by [USE OCL](https://sourceforge.net/projects/useocl/) tool (by University of bremen).

**THIS IS A PRELIMINARY EXPERIMENTAL VERSION, DOT NOT USE FOR PRODUCTION.**

Installation
------------

This plugin has to be installed in the StarUML user [configuration
directory](https://docs.staruml.io/developing-extensions/getting-started#create-an-extension) :

* MacOS: ~/Library/Application Support/StarUML/extensions/user
* Windows: C:\Users\<user>\AppData\Roaming\StarUML\extensions\user
* ~/.config/StarUML/extensions/user 

Select the directory suited to your OS and in a shell windows enter :

    cd the_config_dir_as_mentioned_above
    git clone https://github.com/ScribesZone/scribeszone.staruml-modelscript

NOTE: Though this is not compulsory it is best to install the companion
[staruml_files](https://github.com/ScribesZone/scribeszone.staruml-files) plugin since it is used to open files and in particular
generated files.

    git clone https://github.com/ScribesZone/scribeszone.staruml-files

To test the installation start StarUML (or reload it with ctrl-R if is
already opened) then check that the presence of the following menu :

  Tools > ModelScript

If you see this menu then the plugin is loaded. You can try the USE OCL
generator with `Tools > ModelScript > Generate` or `Ctrl-W`. This should
open a window indicating if the model contains errors and generate code.
See below.

Features
--------

This plugin provided the following features :

* diagram beautifier,
* model checks,
* modelscript generation


Diagram beautifer (Alt-W)
-------------------------

Colors and other diagram attributes can be enforced automatically
making it possible to get a consistent style across the project.

* colors of classes, enumerations, associations, objects and links.
* attribute visibility (`+`,`-`,`#`,`~`) is systematically hidden as this
  makes no sense in conceptual class diagrams.
* operations and receptions compartments are hidden.

The beautifer can be launched via the `Tools > ModelScript > Beautify` menu
or via `Alt-W`. All diagrams are beautified at once.

Checking models (Ctrl-W)
------------------------

Various consistency checks are run on all the following elements.
This includes 
* classes,
* attributes,
* enumerations,
* enumerations literals,
* associations,
* roles,
* object,
* slots,
* links,
* link ends.

The checker is always launched before generation (see section below).

ModelScript Generation (Ctrl->W)
--------------------------------

After checking the model (see above) the following files are generated :

* the **class model**. The class model is written in the file `classes.cl1`.
  This file is expressed in [ClassScript1](https://modelscript.readthedocs.io/en/latest/languages/classes1/index.html) which is a superset of
   USE OCL. Note that the name of the generated file is always `classes.cl1`.

* **state models**. State models are object models with the stereotype 
  `<<state>>`. The name of the generated file is the name of the model
  plus the `.ob1` extension. For instance the object model `<<state>>o1`
  will generate the file `o1.ob1`. Generated state models are written
  in the [ObjectScript1](https://modelscript.readthedocs.io/en/latest/languages/objects1/index.html) language.

* the **usecase model**. Actors and usecases are used to generate the
  `cu.uss` script expressed in the [UsecaseScript](https://modelscript.readthedocs.io/en/latest/languages/usecases/index.html) language.

The generator (and checker) can be launched thanks to the 
`StarUML > Tools > ModelScript > Generate` menu or the `Ctrl-w` keyboard
shortcut.

The structure of the generated directory and files depends on the
preference of the plugin :

* *Flat structure* : all files are generated in the same directory of
  the StarUML `.mdj` file. For instance the `classes.cl1` will be
  at the same level. This is the default behavior.

* *ModelScript structure* : the generator also support the 
  [ModelScript artefact structure](https://modelscript.readthedocs.io/en/latest/artefacts/index.html). In this case the class model
  will be saved in the `concepts/classes/classes.cl1` file. In order
  to select this behavior check the following option 
  `Preferences > ModelScript > Use ModelScript artefact structure`.

Resources
---------

The `resources/` directory contains two startup models that might be
useful when starting a new project.
