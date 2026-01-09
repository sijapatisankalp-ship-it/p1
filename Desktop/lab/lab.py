import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

eqn = input('enter the function of x using python syntax in numpy: ')

def F(x, eqn):
    try:
        return eval(eqn)
    except (SyntaxError, NameError, TypeError) as e:
        print(e)
        exit(0)

def f(x):
    return F(x, eqn)

a = float(input("enter the initial guess a: "))
b= float(input("enter the initial guess b: "))

if f(a) * f(b) > 0:
    print(f'root does not lie between {a} and {b}')
    exit(0)
else:
    e = float(input("enter error tolerance: "))
    n = int(input("enter the no of iteration: "))
    
    data = []
    b_values=[] 

    itr = 1
    
    # Using local variables to avoid overwriting lists
    while itr <= n:
        c = (a + b) / 2
        b_values.append(c)
        if f(a)*f(c)<0:
            b=c
        else:
            a=c
        
        error = abs(b - a)
        data.append([itr, a, b, c, f(a), f(b), f(c), error])
        
        if error < e:
            break
        itr+=1
            

    if itr > n:
        print(f'solution is not reached in {n} iteration')
    else:
        table = pd.DataFrame(data, columns=['iteration', 'a', 'b', 'c', 'f(a)', 'f(b)', 'f(c)', 'error'])
        print(table.to_string(index=False))
x=np.linspace(-5,5,1000)
y=np.zeros_like(b_values)
b=np.array(b_values)
plt.plot(x,f(x),label='graph of f(x)')
plt.scatter(b,y,marker='x')
plt.axhline(0)

plt.axvline(0)


plt.xlabel('x-axis')
plt.ylabel('y-axis')
plt.title('Bisection method')
plt.show()
