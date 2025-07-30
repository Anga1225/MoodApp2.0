import random
import time


def Bubble_Sort(A):
    for i in range(len(A)):
        for j in range(len(A) - i - 1):
            if A[j] > A[j + 1]:
                temp = A[j]
                A[j] = A[j + 1]
                A[j + 1] = temp


def Insertion_Sort(A):
    for i in range(1, len(A)):
       j = i - 1
       key = A[i]
       while j >= 0 and key < A[j]:
           A[j + 1] = A[j]
           j -= 1
       A[j + 1] = key


A = [random.randint(1, 100) for i in range(100)]
ATmp = A.copy()
B = [random.randint(1, 100) for i in range(1000)]
BTmp = B.copy()
C = [random.randint(1, 100) for i in range(10000)]
CTmp = C.copy()
print("Before sort: ", end = "")
print(A)
start1 = time.time()
print("After sort: ", end = "")
Bubble_Sort(A)
end1 = time.time()
print(A)

print("Before sort: ", end = "")
print(ATmp)
start2 = time.time()
print("After sort: ", end = "")
Insertion_Sort(ATmp)
end2 = time.time()
print(ATmp)

print("data num = 100, Bubble Sort time : ", end = "")
print(end1 - start1)
print("data num = 100, Insertion Sort time : ", end = "")
print(end2 - start2)

print("Before sort: ", end = "")
print(B)
start3 = time.time()
print("After sort: ", end = "")
Bubble_Sort(B)
end3 = time.time()
print(B)

print("Before sort: ", end = "")
print(BTmp)
start4 = time.time()
print("After sort: ", end = "")
Insertion_Sort(BTmp)
end4 = time.time()
print(BTmp)

print("data num = 1000, Bubble Sort time : ", end = "")
print(end3 - start3)
print("data num = 1000, Insertion Sort time : ", end = "")
print(end4 - start4)

print("Before sort: ", end = "")
print(C)
start5 = time.time()
print("After sort: ", end = "")
Bubble_Sort(C)
end5 = time.time()
print(C)

print("Before sort: ", end = "")
print(CTmp)
start6 = time.time()
print("After sort: ", end = "")
Insertion_Sort(CTmp)
end6 = time.time()
print(CTmp)

print("data num = 10000, Bubble Sort time : ", end = "")
print(end5 - start5)
print("data num = 10000, Insertion Sort time : ", end = "")
print(end6 - start6)