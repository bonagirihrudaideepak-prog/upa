<?php
class Response
{
    private $statusCode = 200;
    private $headers = [];
    private $data;

    public function setStatusCode($code)
    {
        $this->statusCode = (int)$code;
    }

    public function setJson($data)
    {
        $this->data = json_encode($data, JSON_PRETTY_PRINT);
        $this->headers['Content-Type'] = 'application/json';
    }

    public function send()
    {
        http_response_code($this->statusCode);

        foreach ($this->headers as $key => $value) {
            header("{$key}: {$value}");
        }

        if ($this->data !== null) {
            echo $this->data;
        }
    }
}