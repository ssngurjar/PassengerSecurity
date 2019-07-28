#include <iostream>
using namespace std;
#define MIN(x,y) x>y?x:y
int main(){
	int a=30,b=20,k=0;
	k=MIN(++a,b++);
	cout<<a<<" "<<b<<" "<<k;
	return 0;
}