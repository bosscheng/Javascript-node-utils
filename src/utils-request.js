/**
 * Date:2020/4/8
 * Desc:
 */
const zlib = require('zlib');
const http = require('http');
const https = require('https');

const parse = require('url').parse;
const format = require('url').format;

const debugBody = require('debug')('request:body');
const debugHeader = require('debug')('request:header');

const httpAgent = new http.Agent({keepAlive: true});
const httpsAgent = new https.Agent({keepAlive: true});

const TIMEOUT = 3 * 1000;

const READ_TIMER = Symbol('TIMER:READ_TIMER');
const READ_TIME_OUT = Symbol('TIMER:READ_TIMER_OUT');

const append = function (err, name, message) {
    err.name = name + err.name;
    err.message = `${message}. ${err.message}`;
    return err;
};

const isNumber = function (num) {
    return num !== null && !isNaN(num);
};

exports.request = function (url, opts) {
    opts || (opts = {});

    const parsed = typeof url === 'string' ? parse(url) : url;

    let readTimeout, connectTimeout;

    if (isNumber(opts.readTimeout) || isNumber(opts.connectTimeout)) {
        readTimeout = isNumber(opts.readTimeout) ? Number(opts.readTimeout) : TIMEOUT;
        connectTimeout = isNumber(opts.connectTimeout) ? Number(opts.connectTimeout) : TIMEOUT;
    } else if (isNumber(opts.timeout)) {
        readTimeout = connectTimeout = Number(opts.timeout);
    } else {
        readTimeout = connectTimeout = TIMEOUT;
    }

    const isHttps = parsed.protocol === 'https:';

    const method = (opts.method || 'GET').toUpperCase();

    const defaultAgent = isHttps ? httpsAgent : httpAgent;

    const agent = opts.agent || defaultAgent;

    let options = {
        host: parsed.hostname || 'localhost',
        path: parsed.path || '/',
        method: method,
        port: parsed.port || (isHttps ? 443 : 80),
        agent: agent,
        headers: parsed.headers || {},
        timeout: connectTimeout
    }

    if (isHttps && typeof opts.rejectUnauthorized !== 'undefined') {
        options.rejectUnauthorized = opts.rejectUnauthorized;
    }

    if (opts.compression) {
        options.headers['accept-encoding'] = 'gzip,default';
    }


    const httplib = isHttps ? https : http;

    if (typeof opts.beforeRequest === 'function') {
        options = options.beforeRequest(options);
    }

    return new Promise((resolve, reject) => {
        const request = httplib.request(options);
        const body = opts.data;

        const fulfilled = (response) => {
            if (debugHeader.enabled) {
                const requestHeaders = response.req._header;

                requestHeaders.split('\r\n').forEach((line) => {
                    debugHeader('> %s', line);
                });

                debugHeader('< HTTP/%s %s %s', response.httpVersion, response.statusCode, response.statusMessage);

                Object.keys(response.headers).forEach((key) => {
                    debugHeader('< %s: %s', key, response.headers[key]);
                });
            }
            // resolve
            resolve(response);
        };

        const rejected = (err) => {
            err.message += `${method} ${format(parsed)} failed.`;
            if (request.socket[READ_TIMER]) {
                clearTimeout(request.socket[READ_TIMER]);
            }
            reject(err);
        }

        const abort = (err) => {
            request.abort();
            rejected(err);
        }

        const startResponseTimer = (socket) => {
            const timer = setTimeout(() => {
                if (socket[READ_TIMER]) {
                    clearTimeout(socket[READ_TIMER]);
                    socket[READ_TIMER] = null;
                }
                const err = new Error();
                const message = `ReadTimeout(${readTimeout})`;
                abort(append(err, 'RequestTimeout', message));
            }, readTimeout);
            timer.startTime = Date.now();
            socket[READ_TIME_OUT] = readTimeout;
            socket[READ_TIMER] = timer;
        };

        if (!body || typeof body === 'string' || body instanceof Buffer) {
            if (debugBody.enabled) {
                if (!body) {
                    debugBody('<no request body>');
                } else if ('string' === typeof body) {
                    debugBody(body);
                } else {
                    debugBody(`Buffer <ignored>, Buffer length: ${body.length}`);
                }
            }

            request.end(body);
        } else if (typeof body.pipe === 'function') {
            body.pipe(request);

            if (debugBody.enabled) {
                debugBody('<request body is a stream>');
            }
            body.once('error', (err) => {
                abort(append(err, 'request', 'Stream occor error'));
            })
        }

        request.on('response', fulfilled);
        request.on('error', rejected);
        request.once('socket', (socket) => {
            if (socket.readyState === 'opening') {
                socket.once('connect', () => {
                    startResponseTimer(socket);
                })
            } else {
                startResponseTimer(socket);
            }
        })
    })
};


exports.read = function (response, encoding) {
    let readable = response;

    switch (response.headers['content-encoding']) {
        case 'gzip':
            readable = response.pipe(zlib.createGunzip());
            break;
        case 'default':
            readable = response.pipe(zlib.createInflate());
            break;
        default:
            break;
    }

    return new Promise((resolve, reject) => {
        const makeReadTimeoutError = () => {
            const req = response.req;
            const err = new Error();
            err.name = 'RequestTimeoutError';
            err.message = `ReadTimeout: ${response.socket[READ_TIME_OUT]}. ${req.method} ${req.path} failed.`;
            return err;
        };

        let readTimer;
        const oldReadTimer = response.socket[READ_TIMER];

        if (!oldReadTimer) {
            reject(makeReadTimeoutError());
            return;
        }

        const remainTime = response.socket[READ_TIME_OUT] - (Date.now() - oldReadTimer.startTime);
        clearTimeout(oldReadTimer);
        if (remainTime <= 0) {
            reject(makeReadTimeoutError());
            return;
        }
        readTimer = setTimeout(function () {
            reject(makeReadTimeoutError());
        }, remainTime);
        // start reading data
        let onError, onData, onEnd;
        let cleanup = function () {
            // cleanup
            readable.removeListener('error', onError);
            readable.removeListener('data', onData);
            readable.removeListener('end', onEnd);
            // clear read timer
            if (readTimer) {
                clearTimeout(readTimer);
            }
        };

        const bufs = [];
        let size = 0;

        //
        onData = function (buf) {
            bufs.push(buf);
            size += buf.length;
        };

        //
        onError = function (err) {
            cleanup();
            reject(err);
        };

        //
        onEnd = function () {
            cleanup();
            var buff = Buffer.concat(bufs, size);

            debugBody('');
            if (encoding) {
                const result = buff.toString(encoding);
                debugBody(result);
                return resolve(result);
            }

            if (debugBody.enabled) {
                debugBody(buff.toString());
            }
            resolve(buff);
        };

        readable.on('error', onError);
        readable.on('data', onData);
        readable.on('end', onEnd);
    })
};