// config/associations.js
export const setupAssociations = () => {
  try {
    console.log("🔗 Setting up model associations...");
    
    // Import models
    import('../models/student.js').then(({ default: Student }) => {
      import('../models/institutionSupervisor.js').then(({ default: InstitutionSupervisor }) => {
        import('../models/Logbook.js').then(({ default: Logbook }) => {
          import('../models/Assignment.js').then(({ default: Assignment }) => {
            import('../models/industrySupervisor.js').then(({ default: IndustrySupervisor }) => {
              import('../models/hod.js').then(({ default: HOD }) => {
                import('../models/siwesCoordinator.js').then(({ default: Coordinator }) => {
                  
                  // ============================================
                  // STUDENT ASSOCIATIONS
                  // ============================================
                  Student.associate = function(models) {
                    // Student belongs to InstitutionSupervisor
                    Student.belongsTo(models.InstitutionSupervisor, {
                      foreignKey: 'assignedSupervisor',
                      as: 'Supervisor',
                      constraints: false
                    });
                    
                    // Student belongs to IndustrySupervisor
                    Student.belongsTo(models.IndustrySupervisor, {
                      foreignKey: 'assignedIndustrySupervisor',
                      as: 'IndustrySupervisor',
                      constraints: false
                    });
                    
                    // Student has many Logbooks
                    Student.hasMany(models.Logbook, {
                      foreignKey: 'studentId',
                      as: 'Logbooks',
                      constraints: false
                    });
                    
                    // Student has one Assignment
                    Student.hasOne(models.Assignment, {
                      foreignKey: 'studentId',
                      as: 'Assignment',
                      constraints: false
                    });
                  };
                  
                  // ============================================
                  // INSTITUTION SUPERVISOR ASSOCIATIONS
                  // ============================================
                  InstitutionSupervisor.associate = function(models) {
                    // InstitutionSupervisor has many Students
                    InstitutionSupervisor.hasMany(models.Student, {
                      foreignKey: 'assignedSupervisor',
                      as: 'assignedStudents',
                      constraints: false
                    });
                    
                    // InstitutionSupervisor has many Assignments
                    InstitutionSupervisor.hasMany(models.Assignment, {
                      foreignKey: 'institutionSupervisorId',
                      as: 'Assignments',
                      constraints: false
                    });
                  };
                  
                  // ============================================
                  // LOGBOOK ASSOCIATIONS
                  // ============================================
                  Logbook.associate = function(models) {
                    // Logbook belongs to Student
                    Logbook.belongsTo(models.Student, {
                      foreignKey: 'studentId',
                      as: 'student',
                      constraints: false
                    });
                  };
                  
                  // ============================================
                  // ASSIGNMENT ASSOCIATIONS
                  // ============================================
                  Assignment.associate = function(models) {
                    // Assignment belongs to Student
                    Assignment.belongsTo(models.Student, {
                      foreignKey: 'studentId',
                      as: 'student',
                      constraints: false
                    });
                    
                    // Assignment belongs to InstitutionSupervisor
                    Assignment.belongsTo(models.InstitutionSupervisor, {
                      foreignKey: 'institutionSupervisorId',
                      as: 'institutionSupervisor',
                      constraints: false
                    });
                    
                    // Assignment belongs to IndustrySupervisor
                    Assignment.belongsTo(models.IndustrySupervisor, {
                      foreignKey: 'industrySupervisorId',
                      as: 'industrySupervisor',
                      constraints: false
                    });
                  };
                  
                  // ============================================
                  // INDUSTRY SUPERVISOR ASSOCIATIONS
                  // ============================================
                  IndustrySupervisor.associate = function(models) {
                    // IndustrySupervisor has many Students
                    IndustrySupervisor.hasMany(models.Student, {
                      foreignKey: 'assignedIndustrySupervisor',
                      as: 'assignedStudents',
                      constraints: false
                    });
                    
                    // IndustrySupervisor has many Assignments
                    IndustrySupervisor.hasMany(models.Assignment, {
                      foreignKey: 'industrySupervisorId',
                      as: 'Assignments',
                      constraints: false
                    });
                  };
                  
                  console.log("✅ Model association functions defined");
                  
                }).catch(err => console.error("❌ Failed to import Coordinator:", err));
              }).catch(err => console.error("❌ Failed to import HOD:", err));
            }).catch(err => console.error("❌ Failed to import IndustrySupervisor:", err));
          }).catch(err => console.error("❌ Failed to import Assignment:", err));
        }).catch(err => console.error(" Failed to import Logbook:", err));
      }).catch(err => console.error(" Failed to import InstitutionSupervisor:", err));
    }).catch(err => console.error(" Failed to import Student:", err));
    
  } catch (error) {
    console.error("❌ Error setting up associations:", error);
  }
};

// Initialize associations immediately
setupAssociations();