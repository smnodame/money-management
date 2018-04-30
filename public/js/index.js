var app = angular.module("app", ["ngRoute"])
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "static/html/home.html",
        controller: 'homeCtrl'
    })
    .when("/:id", {
        templateUrl : "static/html/project.html",
        controller: 'projectCtrl'
    })
    .otherwise({redirectTo : '/'})
}).run(() => {
 
})

app.controller('homeCtrl', ['$scope', '$http', '$rootScope', '$route', function($scope, $http, $rootScope, $route) {
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
    
    $http.get('/activities')
    .then(function(res) {
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
    }).then(() => {
        $http.get('/staff').then((res) => {
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
        })
    })

    $scope.del_activity = (key) => {
        
        $http.delete('/activities/'+key).then(function(res) {
            $route.reload()
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
        })
    }

    $scope.add_validation = () => {
        return $scope.activity_name && $scope.activity_budget && $scope.activity_start && $scope.activity_end && ($scope.activity_start <= $scope.activity_end)
    }
}])

app.controller('projectCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
    
      
}])