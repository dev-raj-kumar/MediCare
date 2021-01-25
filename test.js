let department =
 {
    name: 'Medicine',
    note: 'This is medicine department',
    hospitalId: 600035b8d0273a770474172f,
    price: 333,
    doctors: [
      {
        name: 'Susdhnsu Tripathi',
        department: 'Medicine',
        degree: 'M.S From Germany',
        note: 'I am educated and well experienced doctor in this field',
        experience: '25 yrs'
      },
      {
        name: 'Devraj Kumar',
        department: 'Medicine',
        degree: 'PhD Scholar From US',
        note: 'I am educated and well experienced doctor in this field',
        experience: '25 yrs'
      }
    ]
  };
  department = JSON.stringify(Object.assign({}, department));
  JSON.parse(department);
department.name;

  