# Documentation

## Table of contents

- [warble.is](#warbleis)

## Methods

### warble.is

#### Sintaxe

```text
warble.is(value, type[, getDetails]);
```

#### Params

| Param      | Types         | Default   | Description                                    |
| ---------- | ------------- | --------- | ---------------------------------------------- |
| value      | Any           | undefined | A value to be tested.                          |
| type       | String, Array | undefined | The type that the parameter `value` should be. |
| getDetails | Boolean       | false     | Enable a detailed return.                      |

#### Simple examples

##### Source

```javascript
var value = 'Lorem ipsum';

warble.is(value, 'number');
```

##### Output

```javascript
false
```

---

##### Source

```javascript
var value = 'Lorem ipsum';

warble.is(value, 'string')
```

##### Output

```javascript
true
```

#### Multiple tests

##### Source

```javascript
var value = '-1';

warble.is(value, ['numeric', 'positive']);
```

##### Output

```javascript
false
```

---

##### Source

```javascript
var value = '-1';

warble.is(value, ['numeric', 'negative']);
```

##### Output

```javascript
true
```

#### Detailed results

##### Source

```javascript
var value = '-1';

warble.is(value, ['numeric', 'negative'], true);
```

##### Output

```javascript
{
	"negative": false,
	"numeric": true
}
```