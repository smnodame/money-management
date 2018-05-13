var app = angular.module("app", ["ngRoute"])
app.config(function($routeProvider) {
    $routeProvider
    
    .when("/project", {
        templateUrl : "static/html/project.html",
        controller: 'projectCtrl'
    })
    .when("/project/:id", {
        templateUrl : "static/html/sub_project.html",
        controller: 'subProjectCtrl'
    })
    .when("/summary", {
        templateUrl : "static/html/summary.html",
        controller: 'summaryCtrl'
    })
    .when("/", {
        templateUrl : "static/html/main_project.html",
        controller: 'mainCtrl'
    })
    .when("/:key", {
        templateUrl : "static/html/home.html",
        controller: 'homeCtrl'
    })
    .otherwise({redirectTo : '/'})
})

app.run(function($rootScope) { 
    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {

    });
});
var round = 0
app.controller('mainCtrl', [
    '$scope', '$http', '$location', function ($scope, $http, $location) {
        $scope.projects = []

        $scope.open_adding_project = () => {
            $scope.name = ""
            $scope.budget = ""
            $scope.is_update_project = false
        }

        $scope.add_project = () => {
            $http.post('/projects', {
                name: $scope.name,
                budget: $scope.budget
            })
            .then(function(res) {
                load_data()
            })
        }

        $scope.update_project = (key) => {
            $http.put('/projects/' + $scope.key, {
                name: $scope.name,
                budget: $scope.budget
            })
            .then(function(res) {
                load_data()
            })
        }

        $scope.navigate = (key) => {
            $location.path(key)
        }

        $scope.del_project = (key) => {
            $http.delete('/projects/' + key)
            .then(function(res) {
                load_data()
            })
        }

        $scope.open_update_project_modal = (index) => {
            $scope.name = $scope.projects[index].name
            $scope.budget = $scope.projects[index].budget
            $scope.key = $scope.projects[index].key
            $scope.is_update_project = true
        }

        const load_data = () => {
            $http.get('/projects')
            .then(function(res) {
                if(!res.data) {
                    return            
                }

                const data = Object.keys(res.data).map((key) => {
                    return {
                        ...res.data[key],
                        key: key
                    }
                })
                res.data = data
                $scope.projects = res.data
            })
        }

        load_data()

        $scope.validation = () => {
            return $scope.name && parseInt($scope.budget) >= 0
        }
    }   
])

app.controller('summaryCtrl', [
    '$scope', '$http', function ($scope, $http) {
        if(round != 0) {
            location.reload()
        }
        round = 1
        $http.get('/info')
        .then(function(res) {
            if(res.data && res.data.name) {
                $scope.name = res.data.name || ''            
            }
        })
        $scope.budget_all = 1000000
        $scope.activity_select_all = true
        $scope.staff_select_all = true
        $scope.organize_all_selected = true
        $scope.university_selected = true
        $scope.factory_selected = true
        $scope.department_selected = true

        $scope.organize_all_selected_change = () => {
            if($scope.organize_all_selected) {
                $scope.university_selected = true
                $scope.factory_selected = true
                $scope.department_selected = true
            } else {
                $scope.university_selected = false
                $scope.factory_selected = false
                $scope.department_selected = false
            }
            rerender_organize_chart()
        }

        $scope.sub_organize_change = () => {
            rerender_organize_chart()
        }

        const filter_organize = () => {
            const organize_data = []
            if($scope.university_selected) {
                organize_data.push({
                    name: 'มหาวิทยาลัย',
                    y: $scope.u_vate
                })
            }
            if($scope.factory_selected) {
                organize_data.push({
                    name: 'คณะ',
                    y: $scope.f_vate
                })
            }
            if($scope.department_selected) {
                organize_data.push({
                    name: 'ภาค',
                    y: $scope.d_vate
                })
            }
            return organize_data
        }

        const rerender_organize_chart = () => {
            var chart = $('#container-organize').highcharts();
            const organize_selected = filter_organize()
            chart.series[0].setData(organize_selected)
            rereder_type_chart()
        }

        $http.get('/activities')
        .then(function(res) {
            if(res.data) {
                const data = Object.keys(res.data).map((key) => {
                    return {
                        ...res.data[key],
                        key: key,
                        selected: true
                    }
                })
                res.data = data
        
                $scope.activities = res.data
        
                const end_arr = res.data.map((ac) => {
                    return ac.end
                })
        
                function getSumBudget(total, ac) {
                    return total + ac.budget
                }
        
                function getSumDisburse(total, ac) {
                    return total + ac.disburse
                }
        
                const budget_arr = res.data.reduce(getSumBudget, 0)
                const disburse_arr = res.data.reduce(getSumDisburse, 0)
        
                $scope.used_budget = budget_arr
                $scope.used_disburse = disburse_arr
                $scope.percent = ( disburse_arr / budget_arr ) * 100
                $scope.last_month = Math.max(...end_arr)

                return res
            }
            $scope.used_budget = 0
            $scope.used_disburse = 0
            $scope.percent = 0
            $scope.last_month = 0
            return res
        }).then(() => {
            $http.get('/staff').then((res) => {
                if(res.data) {
                    const data = Object.keys(res.data).map((key) => {
                        return {
                            ...res.data[key],
                            key: key,
                            selected: true
                        }
                    })
                    res.data = data
        
                    $scope.staffs = res.data
            
                    function getSumSalary(total, ac) {
                        return total + ac.salary
                    }
            
                    $scope.all_salary = $scope.staffs.reduce(getSumSalary, 0)
                    return res
                }
                $scope.all_salary = 0
            }).then(() => {
                render_chart()
            })
        })

        $scope.on_change_activity_select_all = () => {
            if($scope.activity_select_all) {
                $scope.activities.forEach((value, key) => {
                    value.selected = true
                })
            } else {
                $scope.activities.forEach((value, key) => {
                    value.selected = false
                })
            }

            $scope.on_selected_activity_changed()
        }

        $scope.on_change_staff_select_all = () => {
            if($scope.staff_select_all) {
                $scope.staffs.forEach((value, key) => {
                    value.selected = true
                })
            } else {
                $scope.staffs.forEach((value, key) => {
                    value.selected = false
                })
            }

            $scope.on_selected_staff_changed()
        }

        $scope.on_selected_staff_changed = () => {
            var chart = $('#container-staff').highcharts();
            const staff_selected = filter_staff_selected()
            
            if($scope.staffs.length == staff_selected.length) {
                $scope.staff_select_all = true
            } else {
                $scope.staff_select_all = false
            }

            chart.series[0].setData(staff_selected)

            rereder_type_chart()
        }

        $scope.on_selected_activity_changed = () => {
            var chart = $('#container').highcharts();
            const activity_selected = filter_activity_selected()
            
            if($scope.activities.length == activity_selected.length) {
                $scope.activity_select_all = true
            } else {
                $scope.activity_select_all = false
            }

            chart.series[0].setData(activity_selected)

            rereder_type_chart()
        }

        const filter_staff_selected = () => {
            return $scope.staffs.filter((staff) => {
                return staff.selected
            }).map((staff) => {
                return {
                    name: staff.fullname,
                    y: staff.salary * $scope.last_month
                }
            })
        }

        const filter_activity_selected = () => {
            return $scope.activities.filter((activity) => {
                return activity.selected
            }).map((activity) => {
                return {
                    name: activity.name,
                    y: activity.budget
                }
            })
        }

        const filter_all = () => {
            const activities = filter_activity_selected().reduce((n, o) => {
                return n + o.y
            }, 0)
            const staffs = filter_staff_selected().reduce((n, o) => {
                return n + o.y
            }, 0)
            const organize = filter_organize()
            const organize_all = organize.reduce((n, o) => {
                return n + o.y
            }, 0)
            const remain = $scope.budget_all - (organize_all + staffs + activities)
            return [
                ...organize,

                {
                    name: 'ค่าใช้จ่ายกิจกรรม',
                    y: activities
                },
                {
                    name: 'ค่าใช้จ่ายบุคลากร',
                    y: staffs
                },
                {
                    name: 'คงเหลือ',
                    y: remain
                }
            ]
        }

        const rereder_type_chart = () => {
            var chart = $('#container-type').highcharts();
            const all = filter_all()
            chart.series[0].setData(all)
        }

        const render_chart = () => {
            const activities = filter_activity_selected()
            const staffs = filter_staff_selected()
            const organize = filter_organize()
            const all = filter_all()
            
            // Radialize the colors
            Highcharts.setOptions({
                colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
                    return {
                        radialGradient: {
                            cx: 0.5,
                            cy: 0.3,
                            r: 0.7
                        },
                        stops: [
                            [0, color],
                            [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
                        ]
                    };
                })
            });

            const get_options_graph = (title , data) => {
                return {
                    chart: {
                        plotBackgrเเรกoundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text:  title
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.y}</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                                style: {
                                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                },
                                connectorColor: 'silver'
                            }
                        }
                    },
                    series: [{
                        name: 'Share',
                        data:  data
                    }]
                }
            }

            Highcharts.chart('container', get_options_graph('สัดส่วนค่าใช้จ่ายกิจกรรม', activities))
            Highcharts.chart('container-staff', get_options_graph('สัดส่วนค่าใช้จ่ายบุคลากร', staffs))
            Highcharts.chart('container-organize', get_options_graph('สัดส่วนค่าใช้มหาวิทยาลัย', organize))
            Highcharts.chart('container-type', get_options_graph('สัดส่วนค่าใช้จ่ายตามประเภท', all))
            
        }
    }
])

app.controller('sidebarCtrl', [
    '$scope', '$location', '$route', '$rootScope',
    function($scope, $location, $route, $rootScope) {

        $scope.navigate_home = () => {
            $location.path('')
            $route.reload()
        }

        $scope.navigate_project = () => {
            $location.path('/project')
            $route.reload()
        }

        $scope.navigate_summary = () => {
            $location.path('/summary')
            $route.reload()
        }
    }
])

app.controller('homeCtrl', [
    '$scope', '$http', '$routeParams',
    function($scope, $http, $routeParams) {
        $http.get('/' + $routeParams.key + '/info')
        .then(function(res) {
            if(res.data && res.data.name) {
                $scope.name = res.data.name || ''            
            }
        })
        $scope.activities = []
        $scope.last_month = 10
        $scope.months = Array.from(Array(10).keys())
        
        $http.get('/' + $routeParams.key + '/activities')
        .then(function(res) {
            if(res.data) {
                const data = Object.keys(res.data).map((key) => {
                    return {
                        ...res.data[key],
                        key: key
                    }
                })
                res.data = data
                
                if(!res.data) {
                    return
                }

                $scope.activities = res.data
                const end_arr = res.data.map((ac) => {
                    return ac.end
                })
                const last_month = Math.max(...end_arr)
                if(last_month <= 10) {
                    $scope.months = Array.from(Array(10).keys())
                    $scope.last_month = 10
                } else {
                    $scope.months = Array.from(Array(last_month).keys())
                    $scope.last_month = last_month
                }
            }
        })
    }
])

app.controller('projectCtrl', ['$scope', '$http', '$rootScope', '$route', '$location', function($scope, $http, $rootScope, $route, $location) {
    $(function () {
        $("#datepicker-start").datepicker({ 
                autoclose: true, 
                todayHighlight: true
        }).datepicker('update', new Date())

        $("#datepicker-end").datepicker({ 
            autoclose: true, 
            todayHighlight: true
        }).datepicker('update', new Date())

    })
    $scope.budget_all = 1000000
    $scope.name = ''
    $scope.update_name = () => {
        $scope.show_edit_input = false
        $http.put('/info', {
            name: $scope.name
        })
    }

    $scope.edit_name = () => {
        $scope.show_edit_input = true
    }

    $http.get('/info')
    .then(function(res) {
        if(res.data && res.data.name) {
            $scope.name = res.data.name || ''            
        }
    })

    $http.get('/activities')
    .then(function(res) {
        if(res.data) {
            const data = Object.keys(res.data).map((key) => {
                return {
                    ...res.data[key],
                    key: key
                }
            })
            res.data = data
    
            $scope.activities = res.data
    
            const end_arr = res.data.map((ac) => {
                return ac.end
            })
    
            function getSumBudget(total, ac) {
                return total + ac.budget
            }
    
            function getSumDisburse(total, ac) {
                return total + ac.disburse
            }
    
            const budget_arr = res.data.reduce(getSumBudget, 0)
            const disburse_arr = res.data.reduce(getSumDisburse, 0)
    
            $scope.used_budget = budget_arr
            $scope.used_disburse = disburse_arr
            $scope.percent = ( disburse_arr / budget_arr ) * 100
            $scope.last_month = Math.max(...end_arr)
            return res
        }
        $scope.used_budget = 0
        $scope.used_disburse = 0
        $scope.percent = 0
        $scope.last_month = 0
        return res
    }).then(() => {
        $http.get('/staff').then((res) => {
            if(res.data) {
                const data = Object.keys(res.data).map((key) => {
                    return {
                        ...res.data[key],
                        key: key
                    }
                })
                res.data = data
    
                $scope.staffs = res.data
        
                function getSumSalary(total, ac) {
                    return total + ac.salary
                }
        
                $scope.all_salary = $scope.staffs.reduce(getSumSalary, 0)
                return res
            }
            $scope.all_salary = 0
        })
    })

    $scope.open_adding_activity = () => {
        $scope.activity_name = ""
        $scope.activity_budget = ""
        $scope.activity_start = ""
        $scope.activity_end = ""
        $scope.is_update_activity = false
    }

    $scope.open_adding_staff = () => {
        $scope.staff_name = null
        $scope.staff_department = null
        $scope.staff_type = null
        $scope.staff_position = null
        $scope.staff_salary = null
        $scope.staff_skill = null

        $scope.staff_type = 'บุคลากรหลัก'
        $scope.staff_position = 'หัวหน้าโครงการ'
        $scope.show_main = true
        $scope.staff_salary = 30000
        $scope.show_support = false

        $scope.is_update_staff = false
    }

    $scope.update_staff = () => {
        $http.put('/staff/' + $scope.staff_key, {
            fullname: $scope.staff_name,
            department: $scope.staff_department,
            type: $scope.staff_type,
            position: $scope.staff_position,
            salary: parseInt($scope.staff_salary),
            skill: $scope.staff_skill
        })
        .then(function(res) {
            $route.reload()
        })
    }

    $scope.open_update_activity_modal = (index) => {
        $scope.activity_name = $scope.activities[index].name
        $scope.activity_budget = $scope.activities[index].budget
        $scope.activity_start = $scope.activities[index].start
        $scope.activity_end = $scope.activities[index].end
        $scope.activity_key = $scope.activities[index].key

        $scope.is_update_activity = true
    }

    $scope.open_updating_staff = (index) => {
        $scope.staff_name = $scope.staffs[index].fullname
        $scope.staff_department = $scope.staffs[index].department
        $scope.staff_type = $scope.staffs[index].type
        $scope.staff_position = $scope.staffs[index].position
        $scope.staff_salary = $scope.staffs[index].salary
        $scope.staff_skill = $scope.staffs[index].skill
        $scope.staff_key = $scope.staffs[index].key

        $scope.is_update_staff = true
    }

    $scope.update_activity = () => {
        $http.put('/activities/' + $scope.activity_key , {
            name: $scope.activity_name,
            budget: parseInt($scope.activity_budget),
            start: parseInt($scope.activity_start),
            end: parseInt($scope.activity_end)
        }).then(function(res) {
            $route.reload()
        })
    }
    
    $scope.del_activity = (key) => {
        
        $http.delete('/activities/'+key).then(function(res) {
            $route.reload()
            $('#staff').hide();
            $('#myModal').hide()
        })
    }

    $scope.add_activity = () => {
        $http.post('/activities', {
            name: $scope.activity_name,
            budget: parseInt($scope.activity_budget),
            start: parseInt($scope.activity_start),
            end: parseInt($scope.activity_end),
            disburse:  0
        })
        .then(function(res) {
            $route.reload()
            $('#staff').hide();
            $('#myModal').hide()
        })
    }

    $scope.add_validation = () => {
        return $scope.activity_name && ($scope.activity_budget >= 0) && $scope.activity_start && $scope.activity_end && ($scope.activity_start <= $scope.activity_end)
    }

    $scope.staff_type = 'บุคลากรหลัก'
    $scope.staff_position = 'หัวหน้าโครงการ'
    $scope.show_main = true
    $scope.staff_salary = 30000
    $scope.type_change = () => {
        if($scope.staff_type == 'บุคลากรหลัก') {
            $scope.show_main = true
            $scope.show_support = false
            $scope.staff_position = 'หัวหน้าโครงการ'
            $scope.staff_salary = 30000
        } else {
            $scope.show_main = false
            $scope.show_support = true
            $scope.staff_position = 'ผู้ช่วยนักวิจัย'
            $scope.staff_salary = 20000
        }
    }

    $scope.position_change = () => {
        if($scope.staff_position == 'หัวหน้าโครงการ') {
            $scope.staff_salary = 30000
        } else if ($scope.staff_position == 'นักวิจัย') {
            $scope.staff_salary = 25000
        } else if ($scope.staff_position == 'ผู้ช่วยนักวิจัย') {
            $scope.staff_salary = 20000
        } else {
            $scope.staff_salary = 15000
        }
    }

    $scope.can_add_staff = () => {
        return $scope.staff_position && $scope.staff_type && $scope.staff_name && $scope.staff_department && $scope.staff_salary && $scope.staff_skill
    }

    $scope.add_staff = () => {
        $http.post('/staff', {
            fullname: $scope.staff_name,
            department: $scope.staff_department,
            type: $scope.staff_type,
            position: $scope.staff_position,
            salary: parseInt($scope.staff_salary),
            skill: $scope.staff_skill
        })
        .then(function(res) {
            $(function () {
                $('#staff').hide()
                $('#myModal').hide()
            })
            $route.reload()
        })
    }

    $scope.del_staff = (key) => {
        $http.delete('/staff/'+key).then(() => {
            $route.reload()
        })
    }

    $scope.navigate = (key) => {
        $location.path('project/'+key)
    }
}])

app.controller('subProjectCtrl', ['$scope', '$http', '$rootScope', '$routeParams', '$route', function($scope, $http, $rootScope, $routeParams, $route) {
    
    $(function () {
        $("#datepicker").datepicker({ 
            autoclose: true, 
            todayHighlight: true
        }).datepicker('update', new Date())
    })

    function getSum(total, ac) {
        return total + ac.price
    }

    $http.get('/activities/'+ $routeParams.id )
    .then(function(res) {
        $scope.budget = res.data.budget
        $scope.name = res.data.name
        $scope.sum_price = 0

        if(res.data.activities) {
            const data = Object.keys(res.data.activities).map((key) => {
                return {
                    ...res.data.activities[key],
                    key: key
                }
            })
    
            $scope.sum_price = data.reduce(getSum, 0)
            $scope.activities = data
        }
        
    })

    $scope.add_activity = () => {
        $http.post('/activities/'+ $routeParams.id, {
            name: $scope.new_name,
            price: parseInt($scope.new_price),
            date: $scope.new_date,
            condition: $scope.new_condition || '-',
            sum_price: $scope.sum_price + parseInt($scope.new_price)
        })
        .then(function(res) {
            $route.reload()
        })
    }

    $scope.validation = () => {
        return $scope.new_name && $scope.new_price && $scope.new_date
    }

    $scope.del_activity = (key) => {
        $http.delete('/activities/'+ $routeParams.id + '/' + key)
        .then(function(res) {
            $route.reload()
        })
    }
}])