<?php
class HttpKernel
{
    private $routes = [];

    public function __construct()
    {
        $this->registerRoutes();
    }

    private function registerRoutes()
    {
        $app = $this;
        require BASE_PATH . '/app/routes/index.php';
    }

    public function get($path, $callback)
    {
        $this->routes['GET'][$path] = $callback;
    }

    public function post($path, $callback)
    {
        $this->routes['POST'][$path] = $callback;
    }

    public function put($path, $callback)
    {
        $this->routes['PUT'][$path] = $callback;
    }

    public function delete($path, $callback)
    {
        $this->routes['DELETE'][$path] = $callback;
    }

    public function run()
    {
        $this->setCorsHeaders();
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = $_GET['route'] ?? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $uri = '/' . ltrim($uri, '/');

        $this->request = $this->parseRequest($uri);
        $this->response = new Response();

        $routeFound = false;

        if (isset($this->routes[$method])) {
            foreach ($this->routes[$method] as $path => $callback) {
                $params = $this->matchRoute($path, $uri);
                if ($params !== false) {
                    $routeFound = true;
                    $this->executeRoute($callback, $params, $this->request, $this->response);
                    break;
                }
            }
        }

        if (!$routeFound) {
            $this->response->setStatusCode(404);
            $this->response->setJson(['error' => 'Route not found']);
        }

        $this->response->send();
    }

    private function matchRoute($route, $uri)
    {
        $pattern = preg_replace('/\{[^}]+\}/', '([^/]+)', $route);
        $pattern = '#^' . $pattern . '$#';
        if (preg_match($pattern, $uri, $matches)) {
            array_shift($matches);
            return $matches;
        }
        return false;
    }

    private function executeRoute($callback, $params, $request, $response)
    {
        $preparedParams = $this->prepareRouteParams($params, $request);
        $callback($preparedParams, $response);
    }

    private function prepareRouteParams($params, $request)
    {
        $params = array_map(function ($value) {
            if (is_string($value) && ctype_digit($value)) {
                return (int)$value;
            }
            return $value;
        }, $params);

        return array_merge($request ?? [], ['params' => $params]);
    }

    private function parseRequest($uri)
    {
        $input = $this->getInput();
        return [
            'uri' => $uri,
            'method' => $_SERVER['REQUEST_METHOD'],
            'input' => $input,
            'headers' => $this->getHeaders(),
        ];
    }

    private function getInput()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            return $_GET;
        }
        $contentType = $this->getHeaders()['Content-Type'] ?? '';
        if (strpos($contentType, 'application/json') !== false) {
            $input = json_decode(file_get_contents('php://input'), true);
            return $input ?: [];
        }
        return $_POST;
    }

    private function getHeaders()
    {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
                $headers[$header] = $value;
            }
        }
        if (isset($_SERVER['CONTENT_TYPE'])) {
            $headers['Content-Type'] = $_SERVER['CONTENT_TYPE'];
        }
        return $headers;
    }

    private function setCorsHeaders()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            header('Access-Control-Max-Age: 86400');
            http_response_code(200);
            exit;
        }
    }
}
