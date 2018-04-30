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

app.controller('homeCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
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
    })
}])

app.controller('projectCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
    
      
}])