import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
function=input("enter the funcion in python syntax")

def f(x):
    try:
        return eval(function)
    except SyntaxError as e:
        print("invalid syntax")
        exit(0)
a=float(input("enter the first initial guess"))
b=float(input("enter the second initial guess"))
if f(a)==f(b):
    print("division by zero change initial guesses")
    exit(0)
else:
    e=float(input("enter the error tolerance:"))
    n=float(input("enter the max no. of iterations:"))
    table_data=[]
    m=[]
    i=1
    while i<=n:
        c=(a*f(b)-b*f(a))/(f(b)-f(a))
   
        error=abs((c-b)/c)
        m.append(c)
        table_data.append([i,a,b,c,f(a),f(b),f(c),error])
        if error<e:
            break
        a=b
        b=c
        if f(a)==f(b):
            print("division by zero")
            exit(0)
        i+=1
    if (i>n):
        print("solution not reached in {n} iterations")

    else:
        table=pd.DataFrame(table_data,columns=['i','a','b','c','f(a)','f(b)','f(c)','error'])
        print(table)
        print(f'approximate solution in {i} is {c}')
x=np.linspace(a-5,b+5,1000)
m=np.array(m)
y=np.zeros_like(m)
plt.plot(x,f(x),label='Graph',color='red')
plt.axhline(0)
plt.axvline(0)
plt.xlabel('x-axis')
plt.ylabel('y-axis')
plt.grid(True)
plt.legend()
plt.title('secant method')
plt.scatter(m,y,marker='x')
for j,value in enumerate(m):
    plt.text(m[j],0,f'{j+1}')
plt.show()