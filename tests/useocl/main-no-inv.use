model Demo1

class Employee
attributes
  name : String
  age : Integer
  salary : Real
operations
  raiseSalary(amount : Real) : Real
end

class Department
attributes
  name : String
  location : String
  budget : Integer
end

class Project 
attributes
  name : String
  budget : Integer
end

association WorksIn between
  Employee[*]
  Department[1..*]
end

association WorksOn between
  Employee[*]
  Project[*]
end

associationclass Control between
  Department[1]
  Project[*]
attributes
  frequence : Integer
end



